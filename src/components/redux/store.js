import { configureStore } from "@reduxjs/toolkit";
import authSlice from './slices/authSlice.js'
import wardMapReducer from "./slices/wardMapSlice";
import profileReducer from "./slices/profileSlice.js";
import dashboardReducer from "./slices/dashboardSlice.js";
import areaChartReducer from './slices/Areachartslice.js'
import globalLoaderReducer from "./slices/globalLoaderSlice";
import sendMessageReducer from './slices/sendMessageSlice.js'
import rolesReducer from "./slices/rolesSlice";
import ucTrainingReducer from './slices/Uctrainingslice.js'
import wardReducer from "./slices/wardSlice";
import scoringReducer from "./slices/scoringSlice.js";
import taxonomyReducer from './slices/taxonomySlice.js'
export const store = configureStore({
    reducer: {
        auth: authSlice,
        wardMap: wardMapReducer,
        profile: profileReducer,
        dashboard: dashboardReducer,
        areaChart: areaChartReducer,
        globalLoader: globalLoaderReducer,
        sendMessage: sendMessageReducer,
        roles: rolesReducer,
        ucTraining: ucTrainingReducer,
        ward: wardReducer,
        scoring: scoringReducer,
        taxonomy: taxonomyReducer,
    }
})