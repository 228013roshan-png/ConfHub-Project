import { Router } from "express";
import userRoutes from "./users";
import conferenceRoutes from "./conferences";
import paperRoutes from "./papers";
import reviewerRoutes from "./reviewers";
import reviewRoutes from "./reviews";
import ticketRoutes from "./tickets";
import scheduleRoutes from "./schedule";
import indexingRoutes from "./indexing";
import postRoutes from "./posts";
import dbRoutes from "./dbRoutes";

const apiRouter = Router();

apiRouter.use("/db", dbRoutes);
apiRouter.use("/users", userRoutes);
apiRouter.use("/conferences", conferenceRoutes);
apiRouter.use("/papers", paperRoutes);
apiRouter.use("/reviewers", reviewerRoutes);
apiRouter.use("/reviews", reviewRoutes);
apiRouter.use("/tickets", ticketRoutes);
apiRouter.use("/schedule", scheduleRoutes);
apiRouter.use("/indexing", indexingRoutes);
apiRouter.use("/posts", postRoutes);

export default apiRouter;
