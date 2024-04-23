/**
 * Internal dependencies
 */
import type { Style, StyleOptions } from '../../types';
import { generateRule } from '../utils';

const gradient = {
	name: 'gradient',
	generate: ( style: Style, options: StyleOptions ) => {
		// If there's a background image process it via backgroundImage.
		const _backgroundImage = style?.background?.backgroundImage;
		if (
			typeof _backgroundImage === 'string' ||
			typeof _backgroundImage?.url === 'string'
		) {
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
