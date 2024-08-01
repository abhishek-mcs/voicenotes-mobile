import * as Application from "expo-application"

const MAX_NOTES_STORAGE_LIMIT_IN_DEVICE = 50; // number of audio notes to be cached in device at any given time

enum Environment {
  local = "local",
  rose = "rose",
  rose2 = "rose2",
  stage = "stage",
  xd3 = "xd3",
  stagev2 = "stagev2",
  production = "production",
}

interface URLSETProps {
  MAIN_URL: string
  API_URL: string
  SHORT_URL: string
  CDN_URL: string
}

interface ENVURLs {
  local: URLSETProps
  rose: URLSETProps
  rose2: URLSETProps
  xd3: URLSETProps
  stage: URLSETProps,
  stagev2 : URLSETProps,
  production: URLSETProps
}


const ENVURLSet: ENVURLs = {
  local: {
    MAIN_URL: "https://voicenotes.test",
    // API_URL: "http://192.168.88.137:8000/api",
    API_URL: "http://192.168.88.137:8000",
    SHORT_URL: "bmc.test",
    CDN_URL: "https://bmc-dev.s3.amazonaws.com",
  },
  rose: {
    MAIN_URL: "https://dev-v2.buymeacoffee.com",
    API_URL: "https://xd2.buymeacoffee.com",
    SHORT_URL: "dev-v2.buymeacoffee.com",
    CDN_URL: "https://bmc-dev.s3.amazonaws.com",
  },
  rose2: {
    MAIN_URL: "https://stage.buymeacoffee.com",
    API_URL: "https://stage1.buymeacoffee.com",
    SHORT_URL: "stage.buymeacoffee.com",
    CDN_URL: "https://bmc-dev.s3.amazonaws.com",
  },
  xd3: {
    MAIN_URL: "https://dev-v3.buymeacoffee.com",
    API_URL: "https://xd3.buymeacoffee.com",
    SHORT_URL: "dev-v3.buymeacoffee.com",
    CDN_URL: "https://bmc-dev.s3.amazonaws.com",
  },
  stagev2: {
    MAIN_URL: "https://stage-v2.buymeacoffee.com",
    API_URL: "https://rd4.buymeacoffee.com",
    SHORT_URL: "stage-v2.buymeacoffee.com",
    CDN_URL: "https://bmc-dev.s3.amazonaws.com",
  },
  stage: {
    MAIN_URL: "https://stageview.voicenotes.com",
    API_URL: "https://stagingapi.voicenotes.com",
    SHORT_URL: "stageview.voicenotes.com",
    CDN_URL: "https://cdn.buymeacoffee.com",
  },
  production: {
    MAIN_URL: "https://www.voicenotes.com",
    API_URL: "https://api.voicenotes.com",
    SHORT_URL: "voicenotes.com",
    CDN_URL: "https://cdn.voicenotes.com",
  },
}

// const currentENV: Environment =
//   Updates.channel === "test"
//     ? Environment.rose
//     : Updates.channel == "develop"
//     ? Environment.stage
//     : Environment.production

const currentENV = ENVURLSet.production;
const ota=".2"
const currentVersion = Application.nativeApplicationVersion+ota


const MAIN_URL = currentENV.MAIN_URL
const API_URL = currentENV.API_URL
const SHORTURL = currentENV.SHORT_URL
const CDN_URL = currentENV.CDN_URL


const iosGoogleClientID =
  "364915655162-rv9t4rijv08090u74g8qor6lfnolg9lr.apps.googleusercontent.com"
const androidGoogleClientID =
  "364915655162-gs4kdkb8h98b22op18eiuo1g37dunu0a.apps.googleusercontent.com"
const expoClientID = "364915655162-e0bq980v7askj6mu61pqp1soiv3utm5s.apps.googleusercontent.com"

const facebookAPPID = "471960279833154"

export {
  MAIN_URL,
  API_URL,
  SHORTURL,
  CDN_URL,
  iosGoogleClientID,
  androidGoogleClientID,
  expoClientID,
  facebookAPPID,
  currentENV,
  currentVersion,
  MAX_NOTES_STORAGE_LIMIT_IN_DEVICE
}
