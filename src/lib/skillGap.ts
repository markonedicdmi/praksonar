export type LanguageSkill = { lang: string; level?: string };

export type ProfileForGap = {
    skills: string[] | null;
    languages: LanguageSkill[] | null;
};

export type InternshipForGap = {
    required_skills: string[] | null;
    required_languages: LanguageSkill[] | null;
};

export type Internship = {
    id: string;
    title: string;
    company: string;
    description: string | null;
    location: string | null;
    is_international: boolean;
    field: string | null;
    required_skills: string[] | null;
    required_languages: LanguageSkill[] | null;
    source_url: string | null;
    source_name: string | null;
    deadline: string | null;
    created_at: string;
};

type SkillGapResult = {
    missingSkills: string[];
    missingLanguages: string[];
};

export function getSkillGaps(
    userProfile: ProfileForGap | null,
    internship: Internship
): SkillGapResult {
    const missingSkills: string[] = [];
    const missingLanguages: string[] = [];

    // If no internship requirements, no gaps.
    const reqSkills = internship.required_skills || [];
    const reqLangs = Array.isArray(internship.required_languages)
        ? internship.required_languages
        : [];

    if (reqSkills.length === 0 && reqLangs.length === 0) {
        return { missingSkills, missingLanguages };
    }

    // If no user profile or profile is empty, all requirements are missing.
    if (!userProfile) {
        return {
            missingSkills: reqSkills,
            missingLanguages: reqLangs.map((l: LanguageSkill) => l.lang || 'Nepoznat jezik'),
        };
    }

    const userSkills = userProfile.skills || [];
    const userLangs = Array.isArray(userProfile.languages)
        ? userProfile.languages
        : [];

    // Check missing skills (case-insensitive)
    const userSkillsLower = userSkills.map((s) => s.toLowerCase().trim());
    for (const skill of reqSkills) {
        if (!userSkillsLower.includes(skill.toLowerCase().trim())) {
            missingSkills.push(skill);
        }
    }

    // Check missing languages (by name only for now, case-insensitive)
    const userLangNames = userLangs
        .map((l: LanguageSkill) => l.lang?.toLowerCase().trim())
        .filter(Boolean);

    for (const reqLang of reqLangs) {
        const langName = reqLang.lang?.trim();
        if (langName && !userLangNames.includes(langName.toLowerCase())) {
            missingLanguages.push(langName);
        }
    }

    return { missingSkills, missingLanguages };
}
