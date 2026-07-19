import { AxiosForumThreadRepository } from '../adapters/axios-forum-thread.repository';
import { AxiosForumPostRepository } from '../adapters/axios-forum-post.repository';
import { AxiosForumReportRepository } from '../adapters/axios-forum-report.repository';

const forumThreadRepo = new AxiosForumThreadRepository();
const forumPostRepo = new AxiosForumPostRepository();
const forumReportRepo = new AxiosForumReportRepository();

export const forumThreadRepoInstance = forumThreadRepo;
export const forumPostRepoInstance = forumPostRepo;
export const forumReportRepoInstance = forumReportRepo;