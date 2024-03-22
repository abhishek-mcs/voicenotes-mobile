import { useInfiniteQuery, useMutation, useQueryClient } from "react-query"
import axiosApi from "../../services/api/axios-api"

export function addPostLike(postID:any) {
  const queryClient = useQueryClient()

  return useMutation("add_post_like", () => axiosApi.post(`posts/${postID}/like`), {
    onMutate: async () => {
      const previousPost:any = queryClient.getQueryData(["posts", postID])
      const newPost = previousPost
      if (previousPost.user_liked) {
        newPost.like_count = newPost.like_count - 1
        newPost.user_liked = false
      } else {
        newPost.like_count = newPost.like_count + 1
        newPost.user_liked = true
      }

      queryClient.setQueryData(["posts", postID], newPost)
      return { previousPost, newPost }
    },
    onSettled: (response) => {
      queryClient.invalidateQueries(["posts"])
    },
  })
}

export function useCreatorPosts(projectID:any, categoryId:any,post_type:any) {
  return useInfiniteQuery(
    ["creator_posts", projectID, categoryId],
    async ({ pageParam = 1 }) => {
      const { data } = await axiosApi.get(
        `/project/${projectID}/posts?page=${pageParam}${
          categoryId ? "&category_id=" + categoryId : ""
        }${post_type ? "&post_type=" + post_type : ""}`,
      )
      return data
    },
    {
      getNextPageParam: (lastPage) =>
        lastPage.links.next ? lastPage.meta.current_page + 1 : false,
    },
  )
}

export function useCreatorGallery(projectID:any) {
  return useInfiniteQuery(
    ["creator_gallery", projectID],
    async ({ pageParam = 1 }) => {
      const { data } = await axiosApi.get(
        `/project/${projectID}/posts?page=${pageParam}&post_type=5`,
      )
      return data
    },
    {
      getNextPageParam: (lastPage) =>
        lastPage.links.next ? lastPage.meta.current_page + 1 : false,
    },
  )
}
