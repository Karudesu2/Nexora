<?php

namespace App\Services;

use App\Models\Competency;
use App\Models\CurriculumVersion;
use App\Models\Grade;
use App\Models\SchoolYear;
use App\Models\Subject;
use App\Models\Term;
use Illuminate\Support\Facades\Cache;

class AcademicContextService
{
    public function createSchoolYear(array $data): SchoolYear
    {
        if ($data['is_active'] ?? false) {
            SchoolYear::query()->where('is_active', true)->update(['is_active' => false]);
        }

        $schoolYear = SchoolYear::create($data);
        $this->invalidatePlanningContext();

        return $schoolYear;
    }

    public function createTerm(array $data): Term
    {
        if ($data['is_active'] ?? false) {
            Term::query()
                ->where('school_year_id', $data['school_year_id'])
                ->where('is_active', true)
                ->update(['is_active' => false]);
        }

        $term = Term::create($data);
        $this->invalidatePlanningContext();

        return $term;
    }

    public function createGrade(array $data): Grade
    {
        $grade = Grade::firstOrCreate(['name' => $data['name']]);
        $this->invalidatePlanningContext();

        return $grade;
    }

    public function createSubject(array $data): Subject
    {
        $subject = Subject::firstOrCreate(
            ['name' => $data['name']],
            ['code' => $data['code'] ?? null]
        );
        $this->invalidatePlanningContext();

        return $subject;
    }

    public function createCurriculumVersion(array $data): CurriculumVersion
    {
        if ($data['is_active'] ?? false) {
            CurriculumVersion::query()
                ->where('is_active', true)
                ->update(['is_active' => false]);
        }

        $curriculumVersion = CurriculumVersion::create($data);
        $this->invalidatePlanningContext();

        return $curriculumVersion;
    }

    public function createCompetency(array $data): Competency
    {
        $competency = Competency::create($data);
        $this->invalidatePlanningContext();

        return $competency;
    }

    public function updateCompetency(Competency $competency, array $data): Competency
    {
        $competency->update($data);
        $this->invalidatePlanningContext();

        return $competency->refresh();
    }

    private function invalidatePlanningContext(): void
    {
        Cache::forget('planning-context');
    }
}
