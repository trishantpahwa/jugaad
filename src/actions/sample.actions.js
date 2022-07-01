import { SampleConstants } from '../constants';
import { SampleService } from '../services';

const SampleActions = {
    // setUser: (details) => (dispatch) => {
    //     SessionService.set('user', JSON.stringify(details));
    //     dispatch({ type: UserConstants.SET, details });
    // },
    sampleAction: () => {
        const request = () => ({ type: SampleConstants.TEST_REQUEST });
        const success = (ip) => ({ type: SampleConstants.TEST_SUCCESS, ip });
        const failure = () => ({ type: SampleConstants.TEST_FAILURE });

        return async (dispatch) => {
            dispatch(request());
            const response = await SampleService.test();
            if (response) {
                dispatch(success(response.ip));
            } else {
                dispatch(failure());
            }
        };
    }
};

export default SampleActions;