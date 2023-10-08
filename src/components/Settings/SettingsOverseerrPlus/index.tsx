import Button from '@app/components/Common/Button';
import LoadingSpinner from '@app/components/Common/LoadingSpinner';
import PageTitle from '@app/components/Common/PageTitle';
import globalMessages from '@app/i18n/globalMessages';
import { ArrowDownIcon } from '@heroicons/react/24/solid';
import type { OverseerrPlus } from '@server/lib/settings';
import axios from 'axios';
import { Field, Form, Formik } from 'formik';
import type React from 'react';
import { defineMessages, useIntl } from 'react-intl';
import { useToasts } from 'react-toast-notifications';
import useSWR, { mutate } from 'swr';

const messages = defineMessages({
  overseerrPlus: 'OverseerrPlus',
  overseerrPlusSettings: 'OverseerrPlus Settings',
  overseerrPlusSettingsDescription:
    'Configure global and default OverseerrPlus settings.',
  toastSettingsSuccess: 'OverseerrPlus settings saved successfully!',
  toastSettingsFailure: 'Something went wrong while saving settings.',
  arrivalsTitle: 'Arrivals',
  arrivalsTitleDescription:
    'Enables users to see upcoming scheduled Shows and Movies',

  showArrivals: 'Show Arrivals tab',
  showArrivalsDescription:
    'A feature that allows users to see upcoming tv shows and movies',

  arrivalsMonthView: 'Arriving month view',
  arrivalsMonthViewDescription:
    "Shows the TV Shows & Movies arriving later this month or next month. Note: If current date + 14 days are in the same month, this will show 'Later this month' else this will show 'Next month'",

  showSupportTab: 'Show Support tab',
  showSupportTabDescription:
    'Allow users to support your server hosting efforts',

  paypalOneOffLinkTitle: 'Paypal One-Off Link',
  paypalOneOffLinkDescription:
    'Allow users to send a one-off donation to you via Paypal',

  issueAutoRerequestTitle: 'Auto Rerequest on Issue',
  issueAutoRerequestDescription:
    'Automatically delete the current file and re-request when a user raises an issue with a show or movie',

  paypalRecurringLinkTitle: 'Paypal Monthly Reccuring Link',
  paypalRecurringLinkDescription:
    'Allow users to send a monthly recuring donation to you via Paypal',
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
      <h1 className="text-left text-4xl font-extrabold tracking-tight text-slate-900 dark:text-white sm:text-5xl lg:text-6xl">
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
            issueAutoRerequest: data?.issueAutoRerequest,
            paypalOneOffLink: data?.paypalOneOffLink,
            paypalRecurringLink: data?.paypalRecurringLink,
          }}
          enableReinitialize
          onSubmit={async (values) => {
            try {
              await axios.post('/api/v1/settings/overseerrPlus', {
                showArrivalsTab: values.showArrivalsTab,
                showMonthArrival: values.showMonthArrival,
                showSupportTab: values.showSupportTab,
                issueAutoRerequest: values.issueAutoRerequest,
                paypalOneOffLink: values.paypalOneOffLink,
                paypalRecurringLink: values.paypalRecurringLink,
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
                    <h3 className="heading">
                      {intl.formatMessage(messages.showArrivals)}
                    </h3>
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
                        setFieldValue(
                          'showArrivalsTab',
                          !values.showArrivalsTab
                        );
                      }}
                    />
                  </div>
                </div>

                <div className={values.showArrivalsTab ? 'form-row' : 'hidden'}>
                  <label
                    htmlFor="showMonthArrival"
                    className="checkbox-label pl-8"
                  >
                    {intl.formatMessage(messages.arrivalsMonthView)}
                    <span className="label-tip">
                      {intl.formatMessage(
                        messages.arrivalsMonthViewDescription
                      )}
                    </span>
                  </label>
                  <div className="form-input-area">
                    <Field
                      type="checkbox"
                      id="showMonthArrival"
                      name="showMonthArrival"
                      onChange={() => {
                        setFieldValue(
                          'showMonthArrival',
                          !values.showMonthArrival
                        );
                      }}
                    />
                  </div>
                </div>

                {/* ================= ReRequest On Issue Tab =================*/}
                <div className="form-row">
                  <div className="mb-6">
                    <h3 className="heading">
                      {intl.formatMessage(messages.issueAutoRerequestTitle)}
                    </h3>
                    <p className="description">
                      {intl.formatMessage(
                        messages.issueAutoRerequestDescription
                      )}
                    </p>
                  </div>
                  <div className="form-input-area">
                    <Field
                      type="checkbox"
                      id="issueAutoRerequest"
                      name="issueAutoRerequest"
                      onChange={() => {
                        setFieldValue(
                          'issueAutoRerequest',
                          !values.issueAutoRerequest
                        );
                      }}
                    />
                  </div>
                </div>

                {/* ================= Support Tab =================*/}
                <div className="form-row">
                  <div className="mb-6">
                    <h3 className="heading">
                      {intl.formatMessage(messages.showSupportTab)}
                    </h3>
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

                {/* Support Tab --> Support Paypal on-off dono */}
                <div className={values.showSupportTab ? 'form-row' : 'hidden'}>
                  <label
                    htmlFor="showMonthArrival"
                    className="checkbox-label pl-8"
                  >
                    {intl.formatMessage(messages.paypalOneOffLinkTitle)}
                    <span className="label-tip">
                      {intl.formatMessage(messages.paypalOneOffLinkDescription)}
                    </span>
                  </label>
                  <div className="form-input-area">
                    <Field
                      type="text"
                      id="paypalOneOffLink"
                      name="paypalOneOffLink"
                    />
                  </div>
                </div>
                {/* Support Tab --> Support Paypal monthly dono */}
                <div className={values.showSupportTab ? 'form-row' : 'hidden'}>
                  <label
                    htmlFor="showMonthArrival"
                    className="checkbox-label pl-8"
                  >
                    {intl.formatMessage(messages.paypalRecurringLinkTitle)}
                    <span className="label-tip">
                      {intl.formatMessage(
                        messages.paypalRecurringLinkDescription
                      )}
                    </span>
                  </label>
                  <div className="form-input-area">
                    <Field
                      type="text"
                      id="paypalRecurringLink"
                      name="paypalRecurringLink"
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
