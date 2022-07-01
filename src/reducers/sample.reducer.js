import { SampleConstants } from '../constants';

const initialState = {};

export default (state = initialState, action) => {
    switch (action.type) {
        case SampleConstants.SET:
            return { ...state, details: action.details };
        case SampleConstants.REMOVE:
            return { ...state, details: {} };

        case SampleConstants.TEST_REQUEST:
            return { ...state };
        case SampleConstants.TEST_SUCCESS:
            return { ...state, ip: action.ip };
        case SampleConstants.TEST_FAILURE:
            return { ...state };
        default:
            return state;
    }
};