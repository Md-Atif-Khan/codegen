import { format } from 'date-fns';

const logger = (req, res, next) => {
  const now = format(new Date(), 'yyyy-MM-dd HH:mm:ss');
  console.log(`[${now}] ${req.method} ${req.url}`);
  next();
};

export default logger;