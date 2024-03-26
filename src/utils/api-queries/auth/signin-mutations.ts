import { useMutation } from "react-query"
import axiosApi from "services/api/axios-api"

export function signInWithGoogle() {
  return useMutation("sign_in_google_mutation", (params) => axiosApi.post("/google/login", params))
}

export function signInWithFacebook() {
  return useMutation("sign_in_facebook_mutation", ({ token, fcmToken, uuid }:any) =>
    axiosApi.post("/facebook/login", {
      access_token: token,
      device_token: fcmToken,
      device_uuid: uuid,
    }),
  )
}

export function signInWithTwitter() {
  return useMutation("sign_in_twitter_mutation", (params) =>
    axiosApi.post("/twitter/oauth_login", params),
  )
}

export function signInWithApple() {
  return useMutation("sign_in_apple_mutation", (params) => axiosApi.post("/apple/login", params))
}

export function validateEmail(email: string) {
  if (/^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9-]+(?:\.[a-zA-Z0-9-]+)*$/.test(email)) {
    return true
  }
  return false
}

export function toQueryString(params:any) {
  return (
    "?" +
    Object.entries(params)
      .map(([key, value]:any) => `${encodeURIComponent(key)}=${encodeURIComponent(value)}`)
      .join("&")
  )
}