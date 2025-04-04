import axiosApi from "services/api/axios-api";

export async function publishNotetoPage(
    id: string,
    slug: string
) {
    const response = await axiosApi.post(`/publications/${slug}/publish`, {
        notify: true, recording_uuid: id
    })

    return response.data.data
}

export async function unPublishNoteFromPage(
    id: string,
    slug: string
) {
    const response = await axiosApi.patch(`/publications/${slug}/unpublish`, {
        recording_uuid: id
    })

    return response.data.data
}

export async function publishPublicly(id: string) {
    const response = await axiosApi.patch(`/recordings/${id}/public`)
    return response.data.data
}