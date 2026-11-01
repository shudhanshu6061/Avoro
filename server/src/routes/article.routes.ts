import { Router } from 'express';
import { getPublishedArticleBySlug, listPublishedArticles } from '../controllers/article.controller';

const router = Router();

router.get('/', listPublishedArticles);
router.get('/:slug', getPublishedArticleBySlug);

export default router;