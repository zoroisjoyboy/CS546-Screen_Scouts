import {Router} from 'express';
// import {} from '../data/whateverthefilenameis.js';
import { showData } from '../data/index.js';

const router = Router();

router.route('/').get(async (req, res) => {
    //render the home.handlebars page if not then throw
    try {
      const showList = await showData.getAllShows();
      return res.json(showList);
    } catch (e) {
      return res.status(500).send(e);
    }
  });

router.route('/:id').get(async (req, res) => {
    try {
      const show = await showData.getShowById(req.params.id);
      return res.json(show);
    } catch (e) {
      return res.status(404).json(e);
    }
  });
  
export default router;