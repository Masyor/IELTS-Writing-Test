# Security Specification - IELTS Practice App

## Data Invariants
1. Students cannot join a class unless the code is valid and active.
2. Teachers can only see submissions that belong to their active classes.
3. Users can only update their own user profile (specifically `activeClassCodes`).
4. Only teachers can create and manage classes.

## The "Dirty Dozen" Payloads
1. **Malicious Join**: Student tries to add a class code they don't have to their `activeClassCodes` in the `users` profile without verifying the class exists.
2. **Class Hijack**: User A tries to change the `teacherId` of a class owned by User B.
3. **Submission Scraping**: User A tries to list submissions with a `classCode` they don't belong to.
4. **Retired Class Join**: Student tries to join a class that has `active: false`.
5. **Admin Field Injection**: User tries to set an `isAdmin` field on their profile.
6. **Class ID Poisoning**: Creating a class with a 1MB string as the ID.
7. **Cross-Teacher Submission View**: Teacher A tries to view submissions for a class belonging to Teacher B.
8. **Member Spoofing**: User tries to update their profile by replacing the entire `activeClassCodes` array with codes belonging to someone else.
9. **Relational Orphan**: Submitting a test with a `classCode` that doesn't exist.
10. **Immutable Field Change**: User tries to change their `uid` or `email`.
11. **Outcome Tampering**: Student tries to change the status of a submission after it's submitted.
12. **Anonymous Write**: Attempting to create a submission without being signed in.

## Test Cases
- [x] Students can join active classes.
- [x] Teachers can create classes.
- [x] Students can only view their own submissions.
- [x] Teachers can view submissions only for their classes.
- [x] Users cannot modify other users' profiles.
- [x] Class codes must be correctly formatted.
