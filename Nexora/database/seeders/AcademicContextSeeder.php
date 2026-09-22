<?php

namespace Database\Seeders;

use App\Models\SchoolYear;
use App\Models\Term;
use App\Models\Grade;
use App\Models\Subject;
use Illuminate\Database\Seeder;

class AcademicContextSeeder extends Seeder
{
    public function run(): void
    {
        // Create School Year
        $schoolYear = SchoolYear::updateOrCreate(
            [
                'name' => '2026-2027',
            ],
            [
                'start_date' => '2026-06-01',
                'end_date' => '2027-03-31',
                'is_active' => true,
            ]
        );

        // Create Terms
        Term::updateOrCreate(
            [
                'school_year_id' => $schoolYear->id,
                'term_number' => 1,
            ],
            [
                'name' => 'First Term',
                'start_date' => '2026-06-01',
                'end_date' => '2026-09-30',
                'is_active' => true,
            ]
        );

        Term::updateOrCreate(
            [
                'school_year_id' => $schoolYear->id,
                'term_number' => 2,
            ],
            [
                'name' => 'Second Term',
                'start_date' => '2026-10-01',
                'end_date' => '2026-12-31',
                'is_active' => false,
            ]
        );

        Term::updateOrCreate(
            [
                'school_year_id' => $schoolYear->id,
                'term_number' => 3,
            ],
            [
                'name' => 'Third Term',
                'start_date' => '2027-01-01',
                'end_date' => '2027-03-31',
                'is_active' => false,
            ]
        );


        // Create Grades
        $grades = [
            [
                'name' => 'Grade 7',
                'level' => 7,
            ],
            [
                'name' => 'Grade 8',
                'level' => 8,
            ],
            [
                'name' => 'Grade 9',
                'level' => 9,
            ],
            [
                'name' => 'Grade 10',
                'level' => 10,
            ],
        ];

        foreach ($grades as $grade) {
            Grade::updateOrCreate(
                ['name' => $grade['name']],
                $grade
            );
        }


        // Create Subjects
        $subjects = [
            [
                'name' => 'Mathematics',
                'code' => 'MATH',
                'description' => 'Mathematics subject',
            ],
            [
                'name' => 'Science',
                'code' => 'SCI',
                'description' => 'Science subject',
            ],
            [
                'name' => 'English',
                'code' => 'ENG',
                'description' => 'English subject',
            ],
            [
                'name' => 'Filipino',
                'code' => 'FIL',
                'description' => 'Filipino subject',
            ],
        ];

        foreach ($subjects as $subject) {
            Subject::updateOrCreate(
                ['code' => $subject['code']],
                $subject
            );
        }
    }
}