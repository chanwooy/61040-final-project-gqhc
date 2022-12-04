import { Types, PopulatedDoc, Document } from 'mongoose';
import { Schema, model } from 'mongoose';

export type LessonChunk = {
    type: String, // type of content; e.g., text, image, video -> this will tell us where to look for this chunk of lesson
    content: String; // objectId to query in text/image/video collection from above
};

export type Lesson = {
    _id: Types.ObjectId;
    userId: Types.ObjectId;
    dateCreated: Date;
    dateModified: Date;
    title: string;
    content: Array<LessonChunk>;
};

// mongoose schema definition for Lesson
const LessonSchema = new Schema<Lesson>({
    userId: {
        type: Schema.Types.ObjectId,
        required: true
    },
    dateCreated: {
        type: Date,
        required: true
    },
    dateModified: {
        type: Date,
        required: true
    },
    title: {
        type: String,
        required: true
    },
    content: {
        type: [{ type: String, content: String }],
        required: true
    }
})

const LessonModel = model<Lesson>('Lesson', LessonSchema);
export default LessonModel;