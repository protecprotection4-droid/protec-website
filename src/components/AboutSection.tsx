import React from 'react';
import { Language, SiteContent } from '../types';
import { ProtecLogo } from './ProtecLogo';
import { ScrollReveal } from './ScrollReveal';

interface AboutSectionProps {
  lang: Language;
  content: SiteContent;
}

export const AboutSection: React.FC<AboutSectionProps> = ({ lang, content }) => {
  const isAr = lang === 'ar';
  const goals = isAr ? content.goalsAr : content.goalsEn;
  const values = isAr ? content.valuesAr : content.valuesEn;
  const differentiators = isAr ? content.differentiatorsAr : content.differentiatorsEn;

  return (
    <section
      id="about"
      className="bg-white dark:bg-[#09110C] py-16 lg:py-24 border-b border-[#DCE6DE] dark:border-[#1E3326]"
    >
      <ScrollReveal className="max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8">
        {/* Intro Split: Who is Protec + Official Brand Identity */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12 items-center mb-16">
          <div className="lg:col-span-8">
            <p className="text-xs font-bold text-[#0B5D27] dark:text-[#7AD959] tracking-wide mb-3">
              {isAr ? 'هويتنا التخصصية' : 'Our Identity & Discipline'}
            </p>
            <h2
              className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-[#102116] dark:text-[#ECF4EE] mb-5"
              style={{ textWrap: 'balance' }}
            >
              {isAr
                ? 'من هي شركة Protec؟ علم وقاية النبات في قلب هندسة اللاندسكيب'
                : 'Who is Protec? Agronomic Plant Science at the Core of Landscaping'}
            </h2>
            <p className="text-base sm:text-lg text-[#4B6152] dark:text-[#A3B9AA] leading-relaxed">
              {isAr ? content.aboutSummaryAr : content.aboutSummaryEn}
            </p>
          </div>

          <div className="lg:col-span-4 flex flex-col items-center justify-center text-center py-2">
            <ProtecLogo lang={lang} variant="about" />
          </div>
        </div>

        {/* Vision & Mission */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-16">
          <div className="bg-[#F7FAF7] dark:bg-[#111E16] border border-[#DCE6DE] dark:border-[#213629] rounded-xl p-7">
            <span className="text-xs font-bold text-[#0B5D27] dark:text-[#7AD959] block mb-2">
              01 · {isAr ? 'الرؤية (Vision)' : 'Our Vision'}
            </span>
            <h3 className="text-xl font-bold text-[#102116] dark:text-[#ECF4EE] mb-3">
              {isAr ? 'معيار استدامة المساحات الخضراء' : 'Setting the Standard for Resilient Greenery'}
            </h3>
            <p className="text-sm sm:text-base text-[#4B6152] dark:text-[#A3B9AA] leading-relaxed">
              {isAr ? content.visionAr : content.visionEn}
            </p>
          </div>

          <div className="bg-[#F7FAF7] dark:bg-[#111E16] border border-[#DCE6DE] dark:border-[#213629] rounded-xl p-7">
            <span className="text-xs font-bold text-[#0B5D27] dark:text-[#7AD959] block mb-2">
              02 · {isAr ? 'الرسالة (Mission)' : 'Our Mission'}
            </span>
            <h3 className="text-xl font-bold text-[#102116] dark:text-[#ECF4EE] mb-3">
              {isAr ? 'تكامل التصميم والوقاية والتنفيذ' : 'Integrating Design, Irrigation & Plant Immunity'}
            </h3>
            <p className="text-sm sm:text-base text-[#4B6152] dark:text-[#A3B9AA] leading-relaxed">
              {isAr ? content.missionAr : content.missionEn}
            </p>
          </div>
        </div>

        {/* Goals, Values, and Differentiators */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Goals */}
          <div className="border border-[#DCE6DE] dark:border-[#213629] rounded-xl p-7 bg-white dark:bg-[#0F1B14]">
            <h3 className="text-lg font-bold text-[#102116] dark:text-[#ECF4EE] pb-4 border-b border-[#DCE6DE] dark:border-[#1E3326] mb-5">
              {isAr ? 'أهداف الشركة' : 'Strategic Goals'}
            </h3>
            <ol className="space-y-4">
              {goals.map((item, idx) => (
                <li key={idx} className="flex items-start gap-3 text-sm text-[#4B6152] dark:text-[#A3B9AA] leading-relaxed">
                  <span className="font-mono-num text-xs font-bold text-[#0B5D27] dark:text-[#7AD959] mt-0.5 shrink-0">
                    {String(idx + 1).padStart(2, '0')}.
                  </span>
                  <span>{item}</span>
                </li>
              ))}
            </ol>
          </div>

          {/* Values */}
          <div className="border border-[#DCE6DE] dark:border-[#213629] rounded-xl p-7 bg-white dark:bg-[#0F1B14]">
            <h3 className="text-lg font-bold text-[#102116] dark:text-[#ECF4EE] pb-4 border-b border-[#DCE6DE] dark:border-[#1E3326] mb-5">
              {isAr ? 'قيم ومبادئ Protec' : 'Core Values & Principles'}
            </h3>
            <ol className="space-y-4">
              {values.map((item, idx) => (
                <li key={idx} className="flex items-start gap-3 text-sm text-[#4B6152] dark:text-[#A3B9AA] leading-relaxed">
                  <span className="font-mono-num text-xs font-bold text-[#0B5D27] dark:text-[#7AD959] mt-0.5 shrink-0">
                    {String(idx + 1).padStart(2, '0')}.
                  </span>
                  <span>{item}</span>
                </li>
              ))}
            </ol>
          </div>

          {/* Competitive Edge */}
          <div className="border border-[#0B5D27]/25 dark:border-[#65B32E]/35 rounded-xl p-7 bg-[#F7FAF7] dark:bg-[#111E16]">
            <h3 className="text-lg font-bold text-[#0B5D27] dark:text-[#7AD959] pb-4 border-b border-[#DCE6DE] dark:border-[#213629] mb-5">
              {isAr ? 'ما الذي يميز Protec عن المنافسين؟' : 'Why Choose Protec?'}
            </h3>
            <ol className="space-y-4">
              {differentiators.map((item, idx) => (
                <li key={idx} className="flex items-start gap-3 text-sm text-[#102116] dark:text-[#ECF4EE] leading-relaxed">
                  <span className="font-mono-num text-xs font-bold text-[#65B32E] dark:text-[#7AD959] mt-0.5 shrink-0">
                    {String(idx + 1).padStart(2, '0')}.
                  </span>
                  <span>{item}</span>
                </li>
              ))}
            </ol>
          </div>
        </div>
      </ScrollReveal>
    </section>
  );
};
