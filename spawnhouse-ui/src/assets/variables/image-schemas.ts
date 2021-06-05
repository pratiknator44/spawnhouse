import { IPictureUploadSchema } from '../interfaces/picture-upload-schema.interface';

export class ImageSchemas {
    static readonly user_dpimage_schema: IPictureUploadSchema = {
        aspectRatio: 1/1,
        format: 'jpg',
        resizeToWidth: '200',
        maintainAspectRatio: true
    }

    static readonly user_coverimage_schema: IPictureUploadSchema = {
        aspectRatio: 4/1,
        format: 'jpg',
        resizeToWidth: '1080',
        maintainAspectRatio: true
    }
}