/**
 * Internal dependencies
 */
import { hasBlockSupport } from '../registration';
import { getSaveContent, getBlockDefaultClassName } from '../serializer';
import { parseWithAttributeSchema } from './get-block-attributes';
import { getBlockTypeActiveVariation } from '../../utils';

const CLASS_ATTR_SCHEMA = {
	type: 'string',
	source: 'attribute',
	selector: '[data-custom-class-name] > *',
	attribute: 'class',
};

/**
 * Given an HTML string, returns an array of class names assigned to the root
 * element in the markup.
 *
 * @param {string} innerHTML Markup string from which to extract classes.
 *
 * @return {string[]} Array of class names assigned to the root element.
 */
export function getHTMLRootElementClasses( innerHTML ) {
	const parsed = parseWithAttributeSchema(
		`<div data-custom-class-name>${ innerHTML }</div>`,
		CLASS_ATTR_SCHEMA
	);

	return parsed ? parsed.trim().split( /\s+/ ) : [];
}

/**
 * Given a parsed set of block attributes, if the block supports custom class
 * names and an unknown class (per the block's serialization behavior) is
 * found, the unknown classes are treated as custom classes. This prevents the
 * block from being considered as invalid.
 *
 * @param {Object} blockAttributes Original block attributes.
 * @param {Object} blockType       Block type settings.
 * @param {string} innerHTML       Original block markup.
 *
 * @return {Object} Filtered block attributes.
 */
export function fixCustomClassname( blockAttributes, blockType, innerHTML ) {
	if ( ! hasBlockSupport( blockType, 'customClassName', true ) ) {
		return blockAttributes;
	}

	const modifiedBlockAttributes = { ...blockAttributes };
	// To determine difference, serialize block given the known set of
	// attributes, with the exception of `className`. This will determine
	// the default set of classes. From there, any difference in innerHTML
	// can be considered as custom classes.
	const { className: omittedClassName, ...attributesSansClassName } =
		modifiedBlockAttributes;
	const serialized = getSaveContent( blockType, attributesSansClassName );
	const defaultClasses = getHTMLRootElementClasses( serialized );
	const actualClasses = getHTMLRootElementClasses( innerHTML );

	const customClasses = actualClasses.filter(
		( className ) => ! defaultClasses.includes( className )
	);

	if ( customClasses.length ) {
		modifiedBlockAttributes.className = customClasses.join( ' ' );
	} else if ( serialized ) {
		delete modifiedBlockAttributes.className;
	}

	return modifiedBlockAttributes;
}

export function fixVariationClassname( blockAttributes, blockType, innerHTML ) {
	if ( hasBlockSupport( blockType, 'className', true ) ) {
		const activeVariation = getBlockTypeActiveVariation(
			blockType.variations,
			blockType,
			blockAttributes
		);

		if ( activeVariation ) {
			const variationName = `${ blockType.name }/${ activeVariation.name }`;
			const variationClassName =
				getBlockDefaultClassName( variationName );
			const actualClasses = getHTMLRootElementClasses( innerHTML );
			const hasVariationClassName =
				actualClasses.includes( variationClassName );

			if ( ! hasVariationClassName ) {
				return innerHTML.replace(
					/(<div\s+class=")([^"]*)"/,
					`$1$2 ${ variationClassName }"`
				);
			}
		}
	}

	return innerHTML;
}
