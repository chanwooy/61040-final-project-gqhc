import type {NextFunction, Request, Response} from "express";
import {Types} from 'mongoose';
import RatingCollection from "./collection";

/**
 * Checks if signed-in user has not already rated content
 * If they have throw 409 error
 */
const hasUserNotRatedContent = async (req: Request, res: Response, next: NextFunction) => {
  const userId = req.session.userId;
  const contentId = req.params.contentId;
  const category = req.body.category;
  const rating = await RatingCollection.findOne(userId, contentId, category);

  if (rating) {
    res.status(409).json({
      error: {
        userHasAlreadyRated: 'User has already rated the content'
      }
    });
    return;
  }

  next();
};

/**
 * Checks if signed-in user has already rated content
 * If they have not, throw 409 error
 */
const hasUserRatedContent = async (req: Request, res: Response, next: NextFunction) => {
  const userId = req.session.userId;
  const contentId = req.params.contentId;
  const category = req.body.category;
  const rating = await RatingCollection.findOne(userId, contentId, category);

  if (!rating) {
    res.status(409).json({
      error: {
        userHasNotRated: 'User has not rated the content'
      }
    });
    return;
  }

  next();
};

/**
 * Checks if score is valid
 * If not, throw 400 error
 */
const isValidScore = async (req: Request, res: Response, next: NextFunction) => {
  const score = (req.body.score as number) ?? 101;
  const in_range = score >= 0 && score <= 100;

  if (!in_range) {
    res.status(400).json({
      error: {
        invalidScore: `score ${req.body.score} is either not a number or not in [0, 100]`
      }
    });
    return;
  }

  next();
};

/**
 * Checks if category is one of the 3 pre-defined categories
 * Throw 400 if not
 */
const isValidCategory = async (req:Request, res: Response, next: NextFunction) => {
  const category = (req.body.category as string) ?? '';
  const validCategories = ['Clarity', 'Accuracy', 'Engaging']

  if (!(category in validCategories)) {
    res.status(400).json({
      error: {
        invalidCategory: `category ${category} is not one of the valid categories. Valid categories are: ${validCategories}`
      }
    });
    return;
  }

  next();
};

export {
  hasUserRatedContent,
  hasUserNotRatedContent,
  isValidScore,
  isValidCategory
};
