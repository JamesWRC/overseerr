import TheMovieDb from '@server/api/themoviedb';
import type { TmdbSearchMultiResponse } from '@server/api/themoviedb/interfaces';
import Media from '@server/entity/Media';
import { findSearchProvider } from '@server/lib/search';
import logger from '@server/logger';
import { mapSearchResults } from '@server/models/Search';
import { Router } from 'express';
import { getSettings } from '@server/lib/settings';

const overseerrPlusRoutes = Router();




overseerrPlusRoutes.get('/', async (req, res, next) => {
    res.status(200).json('This API belongs to OverseerrPlus in ./server/routes/overseerrPlus.ts Any new api needs to be added in the overseerr-api.yml file');
});

overseerrPlusRoutes.get('/settings', async (req, res, next) => {
    // Returns settings for overseerrPlus
    const settings = getSettings();
    res.status(200).json(settings.overseerrPlus);

});

overseerrPlusRoutes.get('/company', async (req, res, next) => {
    const tmdb = new TheMovieDb();

    try {
        const results = await tmdb.searchCompany({
            query: req.query.query as string,
            page: Number(req.query.page),
        });

        return res.status(200).json(results);
    } catch (e) {
        logger.debug('Something went wrong retrieving company search results', {
            label: 'API',
            errorMessage: e.message,
            query: req.query.query,
        });
        return next({
            status: 500,
            message: 'Unable to retrieve company search results.',
        });
    }
});

export default overseerrPlusRoutes;
