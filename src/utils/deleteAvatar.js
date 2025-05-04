import { v2 as cloudinary} from "cloudinary"
import dotenv from "dotenv";
import { ApiError } from "./ApiError.js";

dotenv.config({
    path: "./.env"
})

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
})

const deleteFromCloud = async (publicURL, resourceType) => {
    try {
        let publicID = publicURL.split("/").slice(-2).join("/").split(".")[0];
        const response = await cloudinary.api.delete_resources(
            [publicID],
            { type: 'upload', resource_type: resourceType }
        )
        console.log(response.deleted);
        return response.deleted[`${publicID}`];
    }
    catch (error) {
        console.log(error);
        throw new ApiError(430, "Unable to delete file from Cloudinary !");
    }
}
export { deleteFromCloud }