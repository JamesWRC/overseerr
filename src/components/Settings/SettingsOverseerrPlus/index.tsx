import { ArrowDownIcon } from '@heroicons/react/24/solid';
import axios from 'axios';
import { Field, Form, Formik } from 'formik';
import React from 'react';
import { defineMessages, useIntl } from 'react-intl';
import { useToasts } from 'react-toast-notifications';
import useSWR, { mutate } from 'swr';
import type { OverseerrPlus } from '../../../../server/lib/settings';
import globalMessages from '../../../i18n/globalMessages';
import Button from '../../Common/Button';
import LoadingSpinner from '../../Common/LoadingSpinner';
import PageTitle from '../../Common/PageTitle';

const messages = defineMessages({
    overseerrPlus: 'OverseerrPlus',
    overseerrPlusSettings: 'OverseerrPlus Settings',
    overseerrPlusSettingsDescription: 'Configure global and default OverseerrPlus settings.',
    toastSettingsSuccess: 'OverseerrPlus settings saved successfully!',
    toastSettingsFailure: 'Something went wrong while saving settings.',
    arrivalsTitle: 'Arrivals',
    arrivalsTitleDescription: 'Enables users to see upcoming scheduled Shows and Movies',

    showArrivals: 'Show Arrivals tab',
    showArrivalsDescription: 'A feature that allows users to see upcoming tv shows and movies',

    arrivalsMonthView: 'Arriving month view',
    arrivalsMonthViewDescription: 'Shows the TV Shows & Movies arriving later this month or next month. Note: If current date + 14 days are in the same month, this will show \'Later this month\' else this will show \'Next month\'',

    showSupportTab: 'Show Support tab',
    showSupportTabDescription: 'Allow users to support your server hosting efforts',

    stripeOneOffLinkTitle: 'Stripe One-Off Link',
    stripeOneOffLinkDescription: 'Allow users to send a one-off donation to you via Stripe',

    stripeRecurringLinkTitle: 'Stripe Monthly Reccuring Link',
    stripeRecurringLinkDescription: 'Allow users to send a monthly recuring donation to you via Stripe',

});

const SettingsOverseerrPlus: React.FC = () => {
    const { addToast } = useToasts();
    const intl = useIntl();
    const {
        data,
        error,
        mutate: revalidate,
    } = useSWR<OverseerrPlus>('/api/v1/settings/overseerrPlus');

    if (!data && !error) {
        return <LoadingSpinner />;
    }

    return (
        <>
            <PageTitle
                title={[
                    intl.formatMessage(messages.overseerrPlus),
                    intl.formatMessage(globalMessages.settings),
                ]}
            />
            <h1 className="text-slate-900 font-extrabold text-4xl sm:text-5xl lg:text-6xl tracking-tight text-left dark:text-white">
                {[
                    intl.formatMessage(messages.overseerrPlus),
                    ' ',
                    intl.formatMessage(globalMessages.settings),
                ]}
            </h1>
            <br />
            <br />


            <div className="section">
                <Formik
                    initialValues={{
                        showArrivalsTab: data?.showArrivalsTab,
                        showMonthArrival: data?.showMonthArrival,
                        showSupportTab: data?.showSupportTab,
                        stripeOneOffLink: data?.stripeOneOffLink,
                        stripeRecurringLink: data?.stripeRecurringLink,

                    }}
                    enableReinitialize
                    onSubmit={async (values) => {
                        try {
                            await axios.post('/api/v1/settings/overseerrPlus', {
                                showArrivalsTab: values.showArrivalsTab,
                                showMonthArrival: values.showMonthArrival,
                                showSupportTab: values.showSupportTab,
                                stripeOneOffLink: values.stripeOneOffLink,
                                stripeRecurringLink: values.stripeRecurringLink,
                            });
                            mutate('/api/v1/settings/public');

                            addToast(intl.formatMessage(messages.toastSettingsSuccess), {
                                autoDismiss: true,
                                appearance: 'success',
                            });
                        } catch (e) {
                            addToast(intl.formatMessage(messages.toastSettingsFailure), {
                                autoDismiss: true,
                                appearance: 'error',
                            });
                        } finally {
                            revalidate();
                        }
                    }}
                >
                    {({ isSubmitting, values, setFieldValue }) => {
                        return (
                            <Form className="section">
                                <div className="form-row">
                                    <div className="mb-6">
                                        <h3 className="heading">{intl.formatMessage(messages.showArrivals)}</h3>
                                        <p className="description">
                                            {intl.formatMessage(messages.arrivalsTitleDescription)}
                                        </p>
                                    </div>
                                    <div className="form-input-area">
                                        <Field
                                            type="checkbox"
                                            id="showArrivalsTab"
                                            name="showArrivalsTab"
                                            onChange={() => {
                                                setFieldValue('showArrivalsTab', !values.showArrivalsTab);
                                            }}
                                        />
                                    </div>
                                </div>

                                <div className={values.showArrivalsTab ? "form-row" : "hidden"}>
                                    <label htmlFor="showMonthArrival" className="checkbox-label pl-8">
                                        {intl.formatMessage(messages.arrivalsMonthView)}
                                        <span className="label-tip">
                                            {intl.formatMessage(messages.arrivalsMonthViewDescription)}
                                        </span>
                                    </label>
                                    <div className="form-input-area">
                                        <Field
                                            type="checkbox"
                                            id="showMonthArrival"
                                            name="showMonthArrival"
                                            onChange={() => {
                                                setFieldValue('showMonthArrival', !values.showMonthArrival);
                                            }}
                                        />
                                    </div>
                                </div>


                                <div className="form-row">
                                    <div className="mb-6">
                                        <h3 className="heading">{intl.formatMessage(messages.showSupportTab)}</h3>
                                        <p className="description">
                                            {intl.formatMessage(messages.showSupportTabDescription)}
                                        </p>
                                    </div>
                                    <div className="form-input-area">
                                        <Field
                                            type="checkbox"
                                            id="showSupportTab"
                                            name="showSupportTab"
                                            onChange={() => {
                                                setFieldValue('showSupportTab', !values.showSupportTab);
                                            }}
                                        />
                                    </div>
                                </div>

                                {/* // Support Stipe on-off dono */}
                                <div className={values.showSupportTab ? "form-row" : "hidden"}>
                                    <label htmlFor="showMonthArrival" className="checkbox-label pl-8">
                                        {intl.formatMessage(messages.stripeOneOffLinkTitle)}
                                        <span className="label-tip">
                                            {intl.formatMessage(messages.stripeOneOffLinkDescription)}
                                        </span>
                                    </label>
                                    <div className="form-input-area">
                                        <Field
                                            type="text"
                                            id="stripeOneOffLink"
                                            name="stripeOneOffLink"
                                        />
                                    </div>
                                </div>

                                <div className={values.showSupportTab ? "form-row" : "hidden"}>
                                    <label htmlFor="showMonthArrival" className="checkbox-label pl-8">
                                        {intl.formatMessage(messages.stripeRecurringLinkTitle)}
                                        <span className="label-tip">
                                            {intl.formatMessage(messages.stripeRecurringLinkDescription)}
                                        </span>
                                    </label>
                                    <div className="form-input-area">
                                        <Field
                                            type="text"
                                            id="stripeRecurringLink"
                                            name="stripeRecurringLink"
                                        />
                                    </div>
                                </div>

                                <div className="actions">
                                    <div className="flex justify-end">
                                        <span className="ml-3 inline-flex rounded-md shadow-sm">
                                            <Button
                                                buttonType="primary"
                                                type="submit"
                                                disabled={isSubmitting}
                                            >
                                                <ArrowDownIcon />
                                                <span>
                                                    {isSubmitting
                                                        ? intl.formatMessage(globalMessages.saving)
                                                        : intl.formatMessage(globalMessages.save)}
                                                </span>
                                            </Button>
                                        </span>
                                    </div>
                                </div>
                            </Form>
                        );
                    }}
                </Formik>
            </div>
        </>
    );
};

export default SettingsOverseerrPlus;
