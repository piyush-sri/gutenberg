/**
 * Internal dependencies
 */
import type { Style, StyleOptions } from '../../types';
import { generateRule } from '../utils';

const gradient = {
	name: 'gradient',
	generate: ( style: Style, options: StyleOptions ) => {
		// If there's a background image, combine the two under background-image.
		// For backwards compatibility, continue to support the background property.
		// @TODO I don't think this is a good idea. We should use background-image for gradients as well
		// so `background` will never clash with other `background-*` properties.
		if ( !! style?.background?.backgroundImage ) {
			return [];
		}

		return generateRule(
			style,
			options,
			[ 'color', 'gradient' ],
			'background'
		);
	},
};

export default gradient;
