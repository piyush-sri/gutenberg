/**
 * Internal dependencies
 */
import type { Style, StyleOptions } from '../../types';
import { generateRule } from '../utils';

const gradient = {
	name: 'gradient',
	generate: ( style: Style, options: StyleOptions ) => {
		// If there's a background image process it via backgroundImage.
		if ( !! style?.background?.backgroundImage ) {
			return [];
		}

		return generateRule(
			style,
			options,
			[ 'color', 'gradient' ],
			'background-image'
		);
	},
};

export default gradient;
