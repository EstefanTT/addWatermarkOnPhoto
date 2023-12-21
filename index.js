const Jimp = require('jimp');
const webp = require('webp-converter');

const path = require('path');
const { readdirSync, existsSync, mkdirSync } = require('fs')


//###########################################################################################################################################
//####################################################      INSTRUCTIONS      ###############################################################
//###########################################################################################################################################

//###########################################################################################################################################
//######################################################      VARIABLES      ################################################################
//###########################################################################################################################################

// appRoot = __dirname.split('addWatermarkOnPhoto')[0] + 'addWatermarkOnPhoto'

const settings = require('./settings.json')

const directoriesPathToCreate = [
    './photosWithoutWatermark/',
    './photosWithWatermark/',
]

const argument_1 = process.argv[2]

//###########################################################################################################################################
//######################################################      FUNCTIONS      ################################################################
//###########################################################################################################################################

async function convertWebPToPNG(filePath) {
    const outputFilePath = filePath.replace('.webp', '.png');
    await webp.dwebp(filePath, outputFilePath, "-o");
    return outputFilePath;
}

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

async function addWatermarkToImage_evokeheart(fileName, argument_1) {
    try {

        let imagePath = `./photosWithoutWatermark/${fileName}`;
        const fileExtension = path.extname(imagePath).toLowerCase();

        // Check if the image is a WebP file and convert it if necessary
        if (fileExtension === '.webp') {
            imagePath = await convertWebPToPNG(imagePath);
            fileName = path.basename(imagePath); // Update fileName with new extension
        }

        // Load the watermark and the target image
        const watermark = await Jimp.read('./media/copper-plate.png');
        const image = await Jimp.read(imagePath);

        // Resize the watermark
        const watermark_newWidth = Math.round(image.bitmap.width * (settings.copperPlatePercentageOfImageWidth / 100));
        const aspectRatio = watermark.bitmap.width / watermark.bitmap.height;
        const watermark_newHeight = Math.round(watermark_newWidth / aspectRatio);

        watermark.resize(watermark_newWidth, watermark_newHeight);

        // Calculate position for watermark (bottom right with 20px margin)
        let x, y
        if (argument_1 === 'website') {
            x = image.bitmap.width - watermark.bitmap.width - settings.marginRight;
            y = image.bitmap.height - watermark.bitmap.height - settings.marginBottom;
        } else if (argument_1 === 'instagram') {
            x = Math.round((image.bitmap.width / 2) - (watermark_newWidth / 2))
            y = image.bitmap.height - watermark.bitmap.height - settings.marginBottom - settings.extraBottomOnInstagram;
        }

        // Composite the watermark onto the target image
        image.composite(watermark, x, y, {
            mode: Jimp.BLEND_SOURCE_OVER,
            opacitySource: 1.0,
            opacityDest: 1.0
        });

        // Remove the space in the filenames
        fileName = fileName.replaceAll(' ', '_')

        // Save the image with watermark
        if (argument_1 === 'website') {
            await image.writeAsync(`./photosWithWatermark/${fileName}`);
        } else if (argument_1 === 'instagram') {
            fileName = fileName.split('.')[0] + '_instagram.' + fileName.split('.')[1]
            await image.writeAsync(`./photosWithWatermark/${fileName}`);
        }

    } catch (error) {
        console.error('An error occurred:', error);
    }
}

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

async function addWatermarkToImage_protection(fileName) {
    try {

        let imagePath = `./photosWithoutWatermark/${fileName}`;
        const fileExtension = path.extname(imagePath).toLowerCase();

        // Check if the image is a WebP file and convert it if necessary
        if (fileExtension === '.webp') {
            imagePath = await convertWebPToPNG(imagePath);
            fileName = path.basename(imagePath); // Update fileName with new extension
        }

        // Load the the target image
        const image = await Jimp.read(imagePath);

        // Select and Load the the watermark image
        let protectionImgPath = './media/watermark-protection-m.png'
        if (image.bitmap.width > 3700 || image.bitmap.height > 2468)        protectionImgPath = './media/watermark-protection_xl.png'
        else if (image.bitmap.width > 1850 || image.bitmap.height > 1234)   protectionImgPath = './media/watermark-protection_l.png'
        const watermark = await Jimp.read(protectionImgPath);

        // Composite the watermark onto the target image
        image.composite(watermark, 0, 0, {
            mode: Jimp.BLEND_SOURCE_OVER,
            opacitySource: 1.0,
            opacityDest: 1.0
        });

        fileName = fileName.split('.')[0] + '_protected.' + fileName.split('.')[1]
        await image.writeAsync(`./photosWithWatermark/${fileName}`);

    } catch (error) {
        console.error('An error occurred:', error);
    }
}


/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

function createAllNonGitTrackedDirectories(directoriesPathToCreate) {

    directoriesPathToCreate.forEach(directoryPathToCreate => {
        if (!existsSync(directoryPathToCreate)) {
            mkdirSync(directoryPathToCreate)
        }
    })
}

//###########################################################################################################################################
//########################################################      Launch      #################################################################
//###########################################################################################################################################

// Example of iterating over filenames (replace with your actual filenames)
// const fileNames = ['image1.jpg', 'image2.png']; // Replace with your actual file names array
// fileNames.forEach(fileName => addWatermarkToImage_evokeheart(fileName));

async function launch() {

    createAllNonGitTrackedDirectories(directoriesPathToCreate)

    // Warning
    if (argument_1 !== 'website' && argument_1 !== 'instagram' && argument_1 !== 'protection') {
        console.log("The command you enter is not valid, is 'website', 'instagram' or 'protection' written correctly ?")
        return
    }

    const files = readdirSync('./photosWithoutWatermark')

    for (const fileName of files) {
        if (argument_1 === 'website' || argument_1 === 'instagram') {
            await addWatermarkToImage_evokeheart(fileName, argument_1)
        } else if (argument_1 === 'protection') {
            await addWatermarkToImage_protection(fileName)
        }
    }

    console.log("Operation finished, your photos should be in the 'photosWithWatermark' directory.")
}

launch()


/*###########################################################################################################################################
//################################################       NOTES, OBJECTS & JSON       ########################################################
//###########################################################################################################################################



//###########################################################################################################################################
//#####################################################       END       #####################################################################
//#########################################################################################################################################*/

