import { NextPage } from 'next';
import React from 'react';
import Arrivals from '../../components/Arrivals';
import useRouteGuard from '../../hooks/useRouteGuard';
import { Permission } from '../../hooks/useUser';

const ArrivalsPage: NextPage = () => {
    useRouteGuard(
        [
            // Pretty much everyuser 
            Permission.REQUEST
        ],
        {
            type: 'or',
        }
    );
    return <Arrivals />;
};

export default ArrivalsPage;
