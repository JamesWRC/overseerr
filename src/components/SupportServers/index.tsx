import { CheckIcon } from '@heroicons/react/20/solid';
import type { OverseerrPlus } from '@server/lib/settings';
import type React from 'react';
import useSWR from 'swr';

const SupportServers: React.FC = () => {
  const overseerrPlusSettings = useSWR<OverseerrPlus>(() => {
    return '/api/v1/overseerrPlus/settings';
  });
  const tiers = [
    {
      name: '',
      id: 'tier-one-off',
      href: overseerrPlusSettings.data?.paypalOneOffLink,
      priceMonthly: 'Whatever you wanna support',
      description: 'One off support of whatever you want 🙂',
      features: [
        'Support server & site development',
        'Increase server bandwidth',
        'Help manitain server',
        'Limited 4K',
      ],
      btnLbl: 'Support',
    },
    {
      name: 'Supporter',
      id: 'tier-supporter',
      href: overseerrPlusSettings.data?.paypalRecurringLink,
      priceMonthly: '$10',
      description: 'Monthly support',
      features: [
        'Support server & site development',
        'Increase server bandwidth',
        'Help manitain server',
        '4K Requests',
        '4K Streaming 👀',
        'Access to all other hosted sites 😏 ',
      ],
      btnLbl: 'Support monthly',
    },
  ];

  return (
    <>
      <div className="isolate overflow-hidden bg-gray-900">
        <div className="mx-auto max-w-7xl px-6 pb-96 pt-24 text-center sm:pt-32 lg:px-8">
          <div className="mx-auto max-w-4xl">
            <h2 className="text-base font-semibold leading-7 text-indigo-400">
              Support
            </h2>
            <p className="mt-2 text-4xl font-bold tracking-tight text-white sm:text-5xl">
              Wanna help support server costs?{' '}
              <br className="hidden sm:inline lg:hidden" />
            </p>
          </div>
          <div className="relative mt-6">
            <p className="mx-auto max-w-2xl text-lg leading-8 text-white/60">
              A few people have asked how they can support me, servers and
              different services & sites. So if you want to help / show
              appreciation for stuff then feel free to dono. Any support is
              welcome. ❤️{' '}
              <b className="font-bold text-white">
                <u>Don&lsquo;t</u> feel that you have to!
              </b>
            </p>
            <svg
              viewBox="0 0 1208 1024"
              className="absolute -top-10 left-1/2 -z-10 h-[64rem] -translate-x-1/2 [mask-image:radial-gradient(closest-side,white,transparent)] sm:-top-12 md:-top-20 lg:-top-12 xl:top-0"
            >
              <ellipse
                cx={604}
                cy={512}
                fill="url(#6d1bd035-0dd1-437e-93fa-59d316231eb0)"
                rx={604}
                ry={512}
              />
              <defs>
                <radialGradient id="6d1bd035-0dd1-437e-93fa-59d316231eb0">
                  <stop stopColor="#7775D6" />
                  <stop offset={1} stopColor="#E935C1" />
                </radialGradient>
              </defs>
            </svg>
          </div>
        </div>
        <div className="flow-root bg-white pb-24 sm:pb-32">
          <div className="-mt-80">
            <div className="mx-auto max-w-7xl px-6 lg:px-8">
              <div className="mx-auto grid max-w-md grid-cols-1 gap-8 lg:max-w-4xl lg:grid-cols-2">
                {tiers.map((tier) => (
                  <div
                    key={tier.id}
                    className="flex flex-col justify-between rounded-3xl bg-white p-8 shadow-xl ring-1 ring-gray-900/10 sm:p-10"
                  >
                    <div>
                      <h3
                        id={tier.id}
                        className="text-base font-semibold leading-7 text-indigo-600"
                      >
                        {tier.name}
                      </h3>
                      <div className="mt-4 flex items-baseline gap-x-2">
                        <span
                          className={
                            tier.id.includes('one-off')
                              ? 'text-3xl font-bold tracking-tight text-gray-900'
                              : 'text-5xl font-bold tracking-tight text-gray-900'
                          }
                        >
                          {tier.priceMonthly}
                        </span>
                        <span className="text-base font-semibold leading-7 text-gray-600">
                          {tier.id.includes('one-off') ? '' : '/month'}
                        </span>
                      </div>
                      <p className="mt-6 text-base leading-7 text-gray-600">
                        {tier.description}
                      </p>
                      <ul className="mt-10 space-y-4 text-sm leading-6 text-gray-600">
                        {tier.features.map((feature) => (
                          <li key={feature} className="flex gap-x-3">
                            <CheckIcon
                              className="h-6 w-5 flex-none text-indigo-600"
                              aria-hidden="true"
                            />
                            {feature}
                          </li>
                        ))}
                      </ul>
                    </div>
                    <a
                      target="_blank"
                      href={tier.href}
                      aria-describedby={tier.id}
                      className="mt-8 block rounded-md bg-indigo-600 px-3.5 py-2 text-center text-sm font-semibold leading-6 text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
                      rel="noreferrer"
                    >
                      {tier.btnLbl}
                    </a>
                  </div>
                ))}
                {/* <div className="flex flex-col items-start gap-y-6 gap-x-8 rounded-3xl p-8 ring-1 ring-gray-900/10 sm:gap-y-10 sm:p-10 lg:col-span-2 lg:flex-row lg:items-center">
                  <div className="lg:min-w-0 lg:flex-1">
                    <h3 className="text-lg font-semibold leading-8 tracking-tight text-indigo-600">Discounted</h3>
                    <p className="mt-1 text-base leading-7 text-gray-600">
                      Dolor dolores repudiandae doloribus. Rerum sunt aut eum. Odit omnis non voluptatem sunt eos nostrum.
                    </p>
                  </div>
                  <a
                    href="#"
                    className="rounded-md px-3.5 py-2 text-sm font-semibold leading-6 text-indigo-600 ring-1 ring-inset ring-indigo-200 hover:ring-indigo-300 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
                  >
                    Buy discounted license <span aria-hidden="true">&rarr;</span>
                  </a>
                </div> */}
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );

  // return (
  //   <>
  //     {weekDayElements}
  //     {nextWeek}
  //     {/* {overseerrPlusSettings.data?.OSPArrivalsShowMonth ? monthContent : null} */}
  //     {monthContent}
  //   </>
  // );
};

export default SupportServers;
