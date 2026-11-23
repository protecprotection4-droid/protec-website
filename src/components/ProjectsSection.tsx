import React, { useRef, useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Language, ProjectCategory, ProjectItem } from '../types';
import { filterProjectsByCategory } from '../utils/offers';
import { SafeImage } from './SafeImage';
import { ScrollReveal } from './ScrollReveal';

interface ProjectsSectionProps {
  lang: Language;
  projects: ProjectItem[];
}

interface BeforeAfterCardProps {
  project: ProjectItem;
  lang: Language;
  categoryLabel: string;
}

const BeforeAfterCard: React.FC<BeforeAfterCardProps> = ({ project, lang, categoryLabel }) => {
  const isAr = lang === 'ar';
  const [sliderPos, setSliderPos] = useState(50);

  const title = isAr ? project.titleAr : project.titleEn;
  const location = isAr ? project.locationAr : project.locationEn;
  const summary = isAr ? project.summaryAr : project.summaryEn;

  return (
    <article
      data-testid={`project-card-${project.id}`}
      className="w-[86vw] sm:w-[440px] lg:w-[500px] shrink-0 snap-start bg-white dark:bg-[#111E16] border border-[#DCE6DE] dark:border-[#213629] rounded-2xl overflow-hidden flex flex-col"
    >
      {/* Interactive Before / After Comparison Viewport */}
      <div className="relative aspect-[4/3] bg-gradient-to-br from-[#E6EFE8] via-[#EDF5EF] to-[#DCE9DF] dark:from-[#122118] dark:via-[#17281D] dark:to-[#0E1A13] select-none overflow-hidden" dir="ltr">
        {/* After Image (Full background) */}
        <SafeImage
          src={project.afterImageUrl}
          alt={`${title} - ${isAr ? 'بعد التنفيذ' : 'After'}`}
          className="absolute inset-0 w-full h-full object-cover"
        />

        {/* Before Image (Clipped to sliderPos%) */}
        <div
          className="absolute inset-0 overflow-hidden"
          style={{ clipPath: `inset(0 ${100 - sliderPos}% 0 0)` }}
        >
          <SafeImage
            src={project.beforeImageUrl}
            alt={`${title} - ${isAr ? 'قبل التنفيذ' : 'Before'}`}
            className="w-full h-full object-cover"
          />
        </div>

        {/* Vertical Split Line & Handle */}
        <div
          className="absolute top-0 bottom-0 w-0.5 bg-white shadow-sm pointer-events-none"
          style={{ left: `${sliderPos}%` }}
        >
          <div className="absolute top-1/2 -translate-x-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-[#0B5D27] text-white border-2 border-white flex items-center justify-center text-xs font-bold shadow">
            ↔
          </div>
        </div>

        {/* Measured Contrast Scrim Labels */}
        <span className="absolute top-3 left-3 px-2.5 py-1 text-xs font-semibold bg-black/70 text-white rounded">
          {isAr ? 'قبل التنفيذ' : 'Before'}
        </span>
        <span className="absolute top-3 right-3 px-2.5 py-1 text-xs font-semibold bg-[#0B5D27]/90 text-white rounded">
          {isAr ? 'بعد التنفيذ' : 'After'}
        </span>

        {/* Accessible Range Control */}
        <input
          type="range"
          min={0}
          max={100}
          value={sliderPos}
          onChange={(e) => setSliderPos(Number(e.target.value))}
          aria-label={
            isAr
              ? `مقارنة قبل وبعد لمشروع ${title}`
              : `Before and after comparison slider for ${title}`
          }
          className="absolute inset-0 w-full h-full opacity-0 cursor-ew-resize z-10"
        />
      </div>

      {/* Quick Toggle Strip + Card Body */}
      <div className="p-6 flex-1 flex flex-col justify-between">
        <div>
          <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
            <div className="flex flex-wrap items-center gap-2 text-xs text-[#4B6152] dark:text-[#A3B9AA]">
              <span className="font-semibold text-[#0B5D27] dark:text-[#7AD959]">{categoryLabel}</span>
              <span aria-hidden="true">·</span>
              <span>{location}</span>
              {project.areaSqm ? (
                <>
                  <span aria-hidden="true">·</span>
                  <span className="font-mono-num tabular-nums">
                    {project.areaSqm} {isAr ? 'م²' : 'm²'}
                  </span>
                </>
              ) : null}
            </div>

            <div className="flex items-center gap-1 text-xs">
              <button
                type="button"
                onClick={() => setSliderPos(100)}
                className={`px-2 py-1 rounded transition-colors ${
                  sliderPos >= 85
                    ? 'bg-[#0B5D27] text-white font-semibold'
                    : 'text-[#4B6152] dark:text-[#A3B9AA] hover:bg-[#F1F6F2] dark:hover:bg-[#17281D]'
                }`}
              >
                {isAr ? 'قبل' : 'Before'}
              </button>
              <button
                type="button"
                onClick={() => setSliderPos(50)}
                className={`px-2 py-1 rounded transition-colors ${
                  sliderPos > 15 && sliderPos < 85
                    ? 'bg-[#0B5D27] text-white font-semibold'
                    : 'text-[#4B6152] dark:text-[#A3B9AA] hover:bg-[#F1F6F2] dark:hover:bg-[#17281D]'
                }`}
              >
                {isAr ? 'مقارنة' : 'Split'}
              </button>
              <button
                type="button"
                onClick={() => setSliderPos(0)}
                className={`px-2 py-1 rounded transition-colors ${
                  sliderPos <= 15
                    ? 'bg-[#0B5D27] text-white font-semibold'
                    : 'text-[#4B6152] dark:text-[#A3B9AA] hover:bg-[#F1F6F2] dark:hover:bg-[#17281D]'
                }`}
              >
                {isAr ? 'بعد' : 'After'}
              </button>
            </div>
          </div>

          <h3 className="text-lg font-bold text-[#102116] dark:text-[#ECF4EE] mb-2">{title}</h3>
          <p className="text-sm text-[#4B6152] dark:text-[#A3B9AA] leading-relaxed">{summary}</p>
        </div>
      </div>
    </article>
  );
};

export const ProjectsSection: React.FC<ProjectsSectionProps> = ({ lang, projects }) => {
  const isAr = lang === 'ar';
  const [activeCategory, setActiveCategory] = useState<'all' | ProjectCategory>('all');
  const scrollContainerRef = useRef<HTMLDivElement | null>(null);

  const categories: { id: 'all' | ProjectCategory; labelAr: string; labelEn: string }[] = [
    { id: 'all', labelAr: 'كل المشروعات', labelEn: 'All Projects' },
    { id: 'landscaping', labelAr: 'اللاندسكيب وتنسيق الحدائق', labelEn: 'Landscaping' },
    { id: 'plant-protection', labelAr: 'وقاية النبات ومكافحة الآفات', labelEn: 'Plant Protection' },
    { id: 'irrigation', labelAr: 'شبكات الري', labelEn: 'Irrigation' },
    { id: 'maintenance', labelAr: 'الصيانة الدورية', labelEn: 'Maintenance' },
  ];

  const categoryLabelMap: Record<ProjectCategory, string> = {
    landscaping: isAr ? 'اللاندسكيب' : 'Landscaping',
    'plant-protection': isAr ? 'وقاية النبات' : 'Plant Protection',
    irrigation: isAr ? 'شبكات الري' : 'Irrigation',
    maintenance: isAr ? 'الصيانة الدورية' : 'Maintenance',
  };

  const filtered = filterProjectsByCategory(projects, activeCategory);

  const scrollGallery = (direction: 'left' | 'right') => {
    const el = scrollContainerRef.current;
    if (!el) return;
    const distance = Math.max(360, Math.round(el.clientWidth * 0.72));
    el.scrollBy({
      left: direction === 'left' ? -distance : distance,
      behavior: 'smooth',
    });
  };

  return (
    <section
      id="projects"
      className="bg-white dark:bg-[#09110C] py-16 lg:py-24 border-b border-[#DCE6DE] dark:border-[#1E3326]"
    >
      <ScrollReveal className="max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 mb-8">
          <div className="max-w-xl">
            <p className="text-xs font-bold text-[#0B5D27] dark:text-[#7AD959] mb-2">
              {isAr ? 'سجل أعمالنا الميدانية' : 'Portfolio & Field Proof'}
            </p>
            <h2
              className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-[#102116] dark:text-[#ECF4EE]"
              style={{ textWrap: 'balance' }}
            >
              {isAr ? 'مشروعات قبل وبعد التنفيذ' : 'Before & After Project Transformations'}
            </h2>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            {/* Interactive Filter Bar */}
            <div
              role="tablist"
              aria-label={isAr ? 'تصنيف المشروعات' : 'Project categories'}
              className="flex flex-wrap items-center gap-1.5 p-1.5 bg-[#F1F6F2] dark:bg-[#111E16] rounded-xl border border-[#DCE6DE] dark:border-[#213629]"
            >
              {categories.map((cat) => {
                const selected = activeCategory === cat.id;
                return (
                  <button
                    key={cat.id}
                    type="button"
                    role="tab"
                    aria-selected={selected}
                    onClick={() => {
                      setActiveCategory(cat.id);
                      scrollContainerRef.current?.scrollTo({ left: 0, behavior: 'smooth' });
                    }}
                    className={`px-3.5 py-2 text-xs font-semibold rounded-lg transition-colors whitespace-nowrap shrink-0 min-h-[38px] ${
                      selected
                        ? 'bg-[#0B5D27] text-white'
                        : 'text-[#2E4235] dark:text-[#C4D8CA] hover:bg-white/80 dark:hover:bg-[#17281D] hover:text-[#102116] dark:hover:text-[#ECF4EE]'
                    }`}
                  >
                    {isAr ? cat.labelAr : cat.labelEn}
                  </button>
                );
              })}
            </div>

            {filtered.length > 1 && (
              <div
                dir="ltr"
                data-testid="projects-scroll-controls"
                className="inline-flex items-center gap-2 shrink-0"
              >
                <button
                  type="button"
                  data-testid="projects-scroll-left"
                  onClick={() => scrollGallery('left')}
                  aria-label={isAr ? 'التمرير لليسار' : 'Scroll left'}
                  className="w-10 h-10 rounded-lg border border-[#DCE6DE] dark:border-[#243D2D] bg-[#F7FAF7] dark:bg-[#111E16] hover:bg-[#E2EDE5] dark:hover:bg-[#1C3224] text-[#0B5D27] dark:text-[#7AD959] inline-flex items-center justify-center transition-colors"
                >
                  <ChevronLeft className="w-5 h-5" aria-hidden="true" />
                </button>
                <button
                  type="button"
                  data-testid="projects-scroll-right"
                  onClick={() => scrollGallery('right')}
                  aria-label={isAr ? 'التمرير لليمين' : 'Scroll right'}
                  className="w-10 h-10 rounded-lg border border-[#DCE6DE] dark:border-[#243D2D] bg-[#F7FAF7] dark:bg-[#111E16] hover:bg-[#E2EDE5] dark:hover:bg-[#1C3224] text-[#0B5D27] dark:text-[#7AD959] inline-flex items-center justify-center transition-colors"
                >
                  <ChevronRight className="w-5 h-5" aria-hidden="true" />
                </button>
              </div>
            )}
          </div>
        </div>

        {filtered.length === 0 ? (
          <div className="bg-[#F7FAF7] dark:bg-[#111E16] border border-[#DCE6DE] dark:border-[#213629] rounded-xl p-12 text-center">
            <p className="text-sm text-[#4B6152] dark:text-[#A3B9AA]">
              {isAr
                ? 'لا توجد مشروعات مسجلة تحت هذا التصنيف حالياً.'
                : 'No projects found in this category yet.'}
            </p>
          </div>
        ) : (
          <div
            ref={scrollContainerRef}
            data-testid="projects-horizontal-track"
            className="flex flex-row gap-6 overflow-x-auto snap-x snap-mandatory scroll-smooth pb-4"
          >
            {filtered.map((project) => (
              <BeforeAfterCard
                key={project.id}
                project={project}
                lang={lang}
                categoryLabel={categoryLabelMap[project.category] || project.category}
              />
            ))}
          </div>
        )}
      </ScrollReveal>
    </section>
  );
};
