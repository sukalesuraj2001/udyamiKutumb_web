import { configureStore } from "@reduxjs/toolkit";
import authSlice from './slices/authSlice.js'
import wardMapReducer from "./slices/wardMapSlice";
import profileReducer from "./slices/profileSlice.js";
import dashboardReducer from "./slices/dashboardSlice.js";
import areaChartReducer from './slices/areaChartSlice.js'
import globalLoaderReducer from "./slices/globalLoaderSlice";
import sendMessageReducer from './slices/sendMessageSlice.js'
import rolesReducer from "./slices/rolesSlice";
import ucTrainingReducer from './slices/Uctrainingslice.js'
import wardReducer from "./slices/wardSlice";
import scoringReducer from "./slices/scoringSlice.js";
import taxonomyReducer from './slices/taxonomySlice.js'
import districtHeadReducer from './slices/Districtheadslice.js'
import headReducer from './slices/headSlice.js'
import membershipPlansReducer from "./slices/membershipPlansSlice.js";
import jobReducer from "./slices/Jobslice.js";
import newsReducer from "./slices/newsSlice.js";
// import globalLoaderReducer from './slices/globalLoaderSlice.js'
export const store = configureStore({
    reducer: {
        globalLoader: globalLoaderReducer,
        auth: authSlice,
        wardMap: wardMapReducer,
        profile: profileReducer,
        dashboard: dashboardReducer,
        areaChart: areaChartReducer,
        // globalLoader: globalLoaderReducer,
        sendMessage: sendMessageReducer,
        roles: rolesReducer,
        ucTraining: ucTrainingReducer,
        ward: wardReducer,
        scoring: scoringReducer,
        taxonomy: taxonomyReducer,
        districtHead: districtHeadReducer,
        head: headReducer,
        membershipPlans: membershipPlansReducer,
        jobs: jobReducer,
        news: newsReducer,
    }
})