

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
    MAIN_URL: "https://bmc.test/",
    API_URL: "https://app.bmc.test",
    SHORT_URL: "bmc.test",
    CDN_URL: "https://bmc-dev.s3.amazonaws.com/",
  },
  rose: {
    MAIN_URL: "https://dev-v2.buymeacoffee.com/",
    API_URL: "https://xd2.buymeacoffee.com",
    SHORT_URL: "dev-v2.buymeacoffee.com",
    CDN_URL: "https://bmc-dev.s3.amazonaws.com/",
  },
  rose2: {
    MAIN_URL: "https://stage.buymeacoffee.com/",
    API_URL: "https://stage1.buymeacoffee.com",
    SHORT_URL: "stage.buymeacoffee.com",
    CDN_URL: "https://bmc-dev.s3.amazonaws.com/",
  },
  xd3: {
    MAIN_URL: "https://dev-v3.buymeacoffee.com/",
    API_URL: "https://xd3.buymeacoffee.com",
    SHORT_URL: "dev-v3.buymeacoffee.com",
    CDN_URL: "https://bmc-dev.s3.amazonaws.com/",
  },
  stagev2: {
    MAIN_URL: "https://stage-v2.buymeacoffee.com/",
    API_URL: "https://rd4.buymeacoffee.com",
    SHORT_URL: "stage-v2.buymeacoffee.com",
    CDN_URL: "https://bmc-dev.s3.amazonaws.com/",
  },
  stage: {
    MAIN_URL: "https://rd1.buymeacoffee.com/",
    API_URL: "https://rd3.buymeacoffee.com",
    SHORT_URL: "buymeacoffee.com",
    CDN_URL: "https://cdn.buymeacoffee.com/",
  },
  production: {
    MAIN_URL: "https://www.voicenotes.com/",
    API_URL: "https://api.voicenotes.com/",
    SHORT_URL: "voicenotes.com",
    CDN_URL: "https://cdn.voicenotes.com/",
  },
}

// const currentENV: Environment =
//   Updates.channel === "test"
//     ? Environment.rose
//     : Updates.channel == "develop"
//     ? Environment.stage
//     : Environment.production

const currentENV = Environment.production;

const MAIN_URL = ENVURLSet[currentENV].MAIN_URL
const API_URL = ENVURLSet[currentENV].API_URL
const SHORTURL = ENVURLSet[currentENV].SHORT_URL
const CDN_URL = ENVURLSet[currentENV].CDN_URL

const TWITTER_REQUEST_URL = API_URL + "/api/v1/twitter/request_token"
const TWITTER_AUTH_URL = "https://api.twitter.com/oauth/authenticate"
const ELASTIC_SEARCH_URL = "https://elastic.buymeacoffee.com/api/as/v1/engines/coffee/search.json"

const iosGoogleClientID =
  "1060077575595-o329sirmr3isp9ejdlp7c8gs6bhdrmr4.apps.googleusercontent.com"
const androidGoogleClientID =
  "1060077575595-ue45supjln965vfva3tu9iof020br9up.apps.googleusercontent.com"
const expoClientID = "1060077575595-q0v2o6ddq379f1vkoedkrqndtds890k1.apps.googleusercontent.com"

const facebookAPPID = "471960279833154"

export {
  MAIN_URL,
  API_URL,
  SHORTURL,
  CDN_URL,
  TWITTER_AUTH_URL,
  TWITTER_REQUEST_URL,
  ELASTIC_SEARCH_URL,
  iosGoogleClientID,
  androidGoogleClientID,
  expoClientID,
  facebookAPPID,
}
