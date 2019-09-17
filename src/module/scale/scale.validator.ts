import { Injectable } from '@nestjs/common';
import * as _ from 'lodash';
import { ApiException } from 'src/common/expection/api.exception';
import { ApiErrorCode } from 'src/common/enum/api-error-code.enum';
@Injectable()
export class ScaleValidator {

  /**
   * 参数校验
   *
   */
  async scaleCheck(scaleObject: any) {
    if (!scaleObject.creatorId || !scaleObject.creatorName)
      return { msg: 'forbidden1' };
    if (!scaleObject.name)
      return { status: 400, code: 4206 };
    if (!scaleObject.scaleType)
      return { status: 400, code: 4207 };
    if (!scaleObject.language)
      return { status: 400, code: 4208 };
    if (!scaleObject.description)
      return { status: 400, code: 4209 };
    if (!_.isArray(scaleObject.tag))
      return { msg: 'forbidden2' }
    if (!scaleObject.tag.length)
      return { status: 400, code: 4210 }
    if (!_.isArray(scaleObject.question) && scaleObject.scaleType !== 'socialScale')
      return { msg: 'forbidden3' }
    if (scaleObject.scaleType !== 'socialScale' && !scaleObject.question.length)
      return { status: 400, code: 4211 }


    const scaleType = scaleObject.scaleType;
    if (scaleType !== 'socialScale' && scaleObject.filterType !== 'frequency') {
      for (let question of scaleObject.question) {
        if (!question.content)
          return { status: 400, code: 4211 }
        if (scaleObject.scaleType === 'baseScale') {
          if (!question.scoreMethod)
            return { status: 400, code: 4213 }
        }
      }
    }
    if (scaleObject.subjectType !== 'text' && scaleObject.subjectType !== 'answer'
      && scaleType !== 'filterScale') {
      if (!_.isArray(scaleObject.option)) {
        throw new ApiException('无权限操作', ApiErrorCode.NO_PERMISSION, 403);

      }
      if (!scaleObject.option.length)
        return { status: 400, code: 4212 }
      for (let option of scaleObject.option) {
        if (!option.content)
          return { status: 400, code: 4212 }
      }
    }
    if (scaleType === 'baseScale') {
      if (!_.isArray(scaleObject.score))
        return { msg: 'forbidden11' }
      if (!scaleObject.score.length)
        return { status: 400, code: 4232 }
      // if (!_.isArray(scaleObject.feedback)) 
      //   return { msg: 'forbidden12' }
      // if (!scaleObject.feedback.length)
      //   return { status: 400, code: 4233 } 
      if (!scaleObject.guide)
        return { status: 400, code: 4231 }
      // if (!scaleObject.feedbackType) 
      //   return { status: 400, code: 4246 })
      let maxScore = 0;
      let minScore;
      for (let score of scaleObject.score) {
        if (score.score !== 0 && !score.score)
          return { status: 400, code: 4214 }
        if (!_.isNumber(score.score))
          return { status: 400, code: 4215 }
        if (score.score < 0)
          return { status: 400, code: 4216 }
        if (score.score > maxScore) maxScore = score.score;
        if (minScore !== 0 && !minScore) {
          minScore = score.score;
        } else if (minScore > score.score) {
          minScore = score.score;
        }
      }
      if (scaleObject.feedback && scaleObject.feedback.length) {
        let feedbacks = _.sortBy(scaleObject.feedback, 'lower')
        let lower;
        for (let feedback of feedbacks) {
          if ((feedback.upper !== 0 && !feedback.upper) ||
            (feedback.lower !== 0 && !feedback.lower))
            return { status: 400, code: 4235 }
          if (!_.isNumber(feedback.upper) || !_.isNumber(feedback.lower))
            return { status: 400, code: 4217 }
          if (feedback.lower < 0 || feedback.upper < 0)
            return { status: 400, code: 4218 }
          if (!feedback.evaluation)
            return { status: 400, code: 4219 }
          if (!feedback.recommend)
            return { status: 400, code: 4220 }
          if (feedback.lower > feedback.upper)
            return { status: 400, code: 4221 }
          if (!lower) {
            lower = { lower: feedback.lower, upper: feedback.upper };
          } else {
            if (feedback.lower < lower.upper)
              return { status: 400, code: 4222 }
            lower = { lower: feedback.lower, upper: feedback.upper }
          }
          if (scaleObject.feedbackType === 'score') {
            if (feedback.lower > maxScore || feedback.upper > maxScore)
              return { status: 400, code: 4223 }
            if (feedback.upper < minScore || feedback.lower < minScore)
              return { status: 400, code: 4224 }
          }
        }
      }
    } else if (scaleType === 'filterScale') {
      if (!scaleObject.subjectType && scaleObject.filterType !== 'frequency')
        return { status: 400, code: 4225 }
      if (!scaleObject.filterType)
        return { status: 400, code: 4226 }
      if (scaleObject.filterType === 'frequency' && !scaleObject.filterScore)
        return { status: 400, code: 4229 }
      // if (scaleObject.filterType === 'frequency' && !scaleObject.guide)
      //   return { status: 400, code: 4231 }
      if (scaleObject.filterType === 'user' && !scaleObject.filterRange)
        return { status: 400, code: 4230 }
    } else if (scaleType === 'social' && !scaleObject.subjectType) {
      return { status: 400, code: 4225 }
    }
    return { status: 200 }
  }
}