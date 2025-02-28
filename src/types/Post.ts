export interface PostProps {
  post_id: string;
  created_at: string;
  last_edited: string;
  user_id: string;
  content: string;
  upvote: number;
  downvote: number;
  report_count: number;
  image_public_url: string[];
  user?: { username: string };
}
