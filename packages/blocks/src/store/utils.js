/**
 * WordPress dependencies
 */
import { RichTextData } from '@wordpress/rich-text';

/**
 * Helper util to return a value from a certain path of the object.
 * Path is specified as either:
 * - a string of properties, separated by dots, for example: "x.y".
 * - an array of properties, for example `[ 'x', 'y' ]`.
 * You can also specify a default value in case the result is nullish.
 *
 * @param {Object}       object       Input object.
 * @param {string|Array} path         Path to the object property.
 * @param {*}            defaultValue Default value if the value at the specified path is nullish.
 * @return {*} Value of the object property at the specified path.
 */
export const getValueFromObjectPath = ( object, path, defaultValue ) => {
	const normalizedPath = Array.isArray( path ) ? path : path.split( '.' );
	let value = object;
	normalizedPath.forEach( ( fieldName ) => {
		value = value?.[ fieldName ];
	} );
	return value ?? defaultValue;
};

function isObject( candidate ) {
	return (
		typeof candidate === 'object' &&
		candidate.constructor === Object &&
		candidate !== null
	);
}

/**
 * Determine whether a set of object properties matches a given object.
 *
 * Given an object of block attributes and an object of variation attributes,
 * this function checks recursively whether all the variation attributes are
 * present in the block attributes object.
 *
 * @param {Object} blockAttributes     The object to inspect.
 * @param {Object} variationAttributes The object of property values to match.
 * @return {boolean} Whether the block attributes match the variation attributes.
 */
export function matchesAttributes( blockAttributes, variationAttributes ) {
	if ( isObject( blockAttributes ) && isObject( variationAttributes ) ) {
		return Object.entries( variationAttributes ).every(
			( [ key, value ] ) =>
				matchesAttributes( blockAttributes?.[ key ], value )
		);
	}

	return blockAttributes === variationAttributes;
}

/** @typedef {import('../api/registration').WPBlockVariation} WPBlockVariation */

/**
 * Returns the active block variation for a given block based on its attributes.
 * Variations are determined by their `isActive` property.
 * Which is either an array of block attribute keys or a function.
 *
 * In case of an array of block attribute keys, the `attributes` are compared
 * to the variation's attributes using strict equality check.
 *
 * In case of function type, the function should accept a block's attributes
 * and the variation's attributes and determines if a variation is active.
 * A function that accepts a block's attributes and the variation's attributes and determines if a variation is active.
 *
 * @param {Array}  variations Data state.
 * @param {Object} blockType  Name of block (example: “core/columns”).
 * @param {Object} attributes Block attributes used to determine active variation.
 *
 * @return {(WPBlockVariation|undefined)} Active block variation.
 */
export function getBlockTypeActiveVariation(
	variations,
	blockType,
	attributes
) {
	const attributeKeys = Object.keys( blockType?.attributes || {} );
	let match;
	let maxMatchedAttributes = 0;

	for ( const variation of variations ) {
		if ( Array.isArray( variation.isActive ) ) {
			const definedAttributes = variation.isActive.filter(
				( attribute ) => {
					// We support nested attribute paths, e.g. `layout.type`.
					// In this case, we need to check if the part before the
					// first dot is a known attribute.
					const topLevelAttribute = attribute.split( '.' )[ 0 ];
					return attributeKeys.includes( topLevelAttribute );
				}
			);
			const definedAttributesLength = definedAttributes.length;
			if ( definedAttributesLength === 0 ) {
				continue;
			}
			const isMatch = definedAttributes.every( ( attribute ) => {
				const variationAttributeValue = getValueFromObjectPath(
					variation.attributes,
					attribute
				);
				if ( variationAttributeValue === undefined ) {
					return false;
				}
				let blockAttributeValue = getValueFromObjectPath(
					attributes,
					attribute
				);
				if ( blockAttributeValue instanceof RichTextData ) {
					blockAttributeValue = blockAttributeValue.toHTMLString();
				}
				return matchesAttributes(
					blockAttributeValue,
					variationAttributeValue
				);
			} );
			if ( isMatch && definedAttributesLength > maxMatchedAttributes ) {
				match = variation;
				maxMatchedAttributes = definedAttributesLength;
			}
		} else if ( variation.isActive?.( attributes, variation.attributes ) ) {
			// If isActive is a function, we cannot know how many attributes it matches.
			// This means that we cannot compare the specificity of our matches,
			// and simply return the best match we have found.
			return match || variation;
		}
	}
	return match;
}
