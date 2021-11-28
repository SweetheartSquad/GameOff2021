/* eslint-disable @typescript-eslint/no-var-requires */
/* eslint-disable no-await-in-loop */
const { ImagePool } = require('@squoosh/lib');
const fs = require('fs');
const path = require('path');

const file = path.resolve(__dirname, process.argv[2]);

const imagePool = new ImagePool();

const pngOptions = { oxipng: 'auto' };
const jpgOptions = { mozjpeg: 'auto' };

(async () => {
	console.log(file);
	const isPng = file.endsWith('.png');
	const image = imagePool.ingestImage(file);
	await image.decoded;
	await image.preprocess({});
	await image.encode(isPng ? pngOptions : jpgOptions);
	const rawEncodedImage = (
		await image.encodedWith[isPng ? 'oxipng' : 'mozjpeg']
	).binary;
	await fs.promises.writeFile(file, rawEncodedImage);

	await imagePool.close();
})()
	.then(() => {
		console.log('✅');
	})
	.catch((err) => {
		console.error(err);
		process.exit(1);
	});
