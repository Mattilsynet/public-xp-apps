import type {ByteSource, Resource, ResourceKey} from '@enonic-types/lib-io'

import {getResource, readText} from '/lib/xp/io'


import Log from '@enonic/mock-xp/dist/Log'
import {isString} from '@enonic/js-utils'
import {describe, expect, jest, test} from '@jest/globals'

export function readResource(filename: string) {
	const resource = getResource(filename);
	if (!resource || !resource.exists()) {
		throw new Error(`Empty or not found: ${filename}`);
	}
	let content: string;
	try {
		content = readText(resource.getStream());
		// log.debug('readResource: filename:%s content:%s', filename, content);
	} catch (e) {
		log.error(e.message);
		throw new Error(`Couldn't read resource: ${filename}`);
	}
	return content;
}

console.debug = () => {}; // Suppress 'stream not a string'

// @ts-ignore TS2339: Property 'log' does not exist on type 'typeof globalThis'.
global.app = {
	name: 'com.acme.example.tsup'
}

// @ts-ignore TS2339: Property 'log' does not exist on type 'typeof globalThis'.
global.log = Log.createLogger({
	loglevel: 'warn'
});

const FILES = {
	'filename.ext': 'juhu',
	'corrupt': true,
};

jest.mock('/lib/xp/io', () => ({
	__esModule: true,
	getResource: jest.fn<typeof getResource>((key: string|ResourceKey) => ({
		exists: jest.fn<Resource['exists']>(() => !!FILES[key as string]),
		getStream: jest.fn<Resource['getStream']>(() => FILES[key as string] as unknown as ByteSource)
	} as unknown as Resource)),
	readText: jest.fn<typeof readText>((stream: ByteSource) => {
		if (isString(stream)) {
			return stream as unknown as string;
		}
		throw new Error('stream not a string');
	})
}), { virtual: true });

class NoErrorThrownError extends Error {}

describe.skip('lib', () => {
	describe('readResource', () => {
		test('it returns the resource content', () => {
			expect(readResource('filename.ext')).toBe(FILES['filename.ext']);
		});
		test('it throws on missing resource', () => {
			expect.assertions(2);
			try {
				readResource('nonExistant.ext');
				throw new NoErrorThrownError();
			} catch (e) {
				expect(e).not.toBeInstanceOf(NoErrorThrownError);
				expect(e.message).toBe('Empty or not found: nonExistant.ext');
			}
		});
		test('it throws on corrupt resource', () => {
			expect.assertions(2);
			try {
				readResource('corrupt');
				throw new NoErrorThrownError();
			} catch (e) {
				expect(e).not.toBeInstanceOf(NoErrorThrownError);
				expect(e.message).toBe("Couldn't read resource: corrupt");
			}
		});
	});
});
