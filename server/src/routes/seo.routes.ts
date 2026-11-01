import { Router } from 'express';
import {
  getPublicGsc,
  getPublicRedirects,
  getPublicRobots,
  getPublicSitemap,
  getPublicPagesSeo,
  getPublicPageSeoByPath,
} from '../controllers/seo.controller';

const router = Router();

router.get('/robots.txt', getPublicRobots);
router.get('/sitemap.xml', getPublicSitemap);
router.get('/redirects', getPublicRedirects);
router.get('/gsc', getPublicGsc);
router.get('/pages', getPublicPagesSeo);
router.get('/page-meta', getPublicPageSeoByPath);

export default router;