import type { Request, Response, NextFunction } from 'express';
import { Types } from 'mongoose';
import CommentCollection from '../comment/collection';
import LessonCollection from '../lesson/collection';

/**
 * Checks if a comment with commentId is req.params exists
 */
const isCommentExists = async (req: Request, res: Response, next: NextFunction) => {
  let commentId = req.params.commentId ? req.params.commentId : String(req.query.commentId);
  console.log(req.query);
  if (commentId == undefined || commentId == "undefined") {
    commentId = req.body.itemId ? String(req.body.itemId) : String(req.query.itemId);
  }
  console.log(commentId);
  const validFormat = Types.ObjectId.isValid(commentId);
  const comment = validFormat ? await CommentCollection.findOne(commentId) : '';
  if (!comment) {
    res.status(404).json({
      error: {
        CommentNotFound: `Comment with comment ID ${commentId} does not exist.`
      }
    });
    return;
  }

  next();
};

/**
 * Checks if a comment of parentLesson with parentLessonId is req.params exists
 */
const isParentExists = async (req: Request, res: Response, next: NextFunction) => {
  console.log("isparent");
  if (!req.params.parentLessonId || req.params.parentLessonId == "undefined") {
    res.status(400).json({
      error: 'Provided lessonId must be nonempty.'
    });
    return;
  }

  const validFormat = Types.ObjectId.isValid(req.params.parentLessonId);

  const lesson = validFormat ? await LessonCollection.findOne(req.params.parentLessonId) : '';
  if (!lesson) {
    res.status(404).json({
      error: {
        ParentLessonNotFound: `Parent Lesson with lesson ID ${req.params.parentLessonId} does not exist. Must comment to a valid lesson.`
      }
    });
    return;
  }

  next();
};

/**
 * Checks if the content of the comment in req.body is valid, i.e not a stream of empty
 * spaces and not more than 280 characters
*/
const isValidCommentContent = (req: Request, res: Response, next: NextFunction) => {
  const { content } = req.body as { content: string };
  if (!content.trim()) {
    res.status(400).json({
      error: 'Comment content must be at least one character long.'
    });
    return;
  }

  if (content.length > 800) {
    res.status(413).json({
      error: 'Comment content must be no more than 800 characters.'
    });
    return;
  }


  next();
};

/**
 * Checks if the current user is the author of the comment whose commentId is in req.params
 */
const isValidCommentModifier = async (req: Request, res: Response, next: NextFunction) => {
  const comment = await CommentCollection.findOne(req.params.commentId);
  const userId = comment.authorId._id;
  if (req.session.userId !== userId.toString()) {
    res.status(403).json({
      error: 'Cannot modify other users\' comments.'
    });
    return;
  }

  next();
};

export {
  isValidCommentContent,
  isCommentExists,
  isParentExists,
  isValidCommentModifier
};