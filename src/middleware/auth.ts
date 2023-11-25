import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

interface User {
  username: string;
  role: string;
}

interface AuthenticatedRequest extends Request {
  user?: User;
}

const SECRET = 'SECr3t';

const authenticateJwt = (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  const authHeader = req.headers.authorization;

  if (authHeader) {
    const token = authHeader.split(' ')[1];

    jwt.verify(token, SECRET, (err, user) => {
      if (err) {
        return res.sendStatus(403);
      }

      req.user = user as User; 
      next();
    });
  } else {
    res.sendStatus(401);
  }
};

export { authenticateJwt, SECRET };
