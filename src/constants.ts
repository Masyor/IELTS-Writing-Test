export const TASK1_CRITERIA = [
  {
    id: 'ta',
    label: 'Task Achievement',
    description: 'How well you address the task requirements in Task 1.',
    scores: {
      9: 'Satisfies all requirements of the task; clearly presents a fully developed response.',
      8: 'Covers all requirements of the task sufficiently; clearly presents and highlights key features.',
      7: 'Covers the requirements of the task; presents a clear overview of main trends or stages.',
      6: 'Addresses the requirements of the task; presents an overview with information appropriately selected.',
      5: 'Generally addresses the task; the format may be inappropriate in places.',
      4: 'Attempts to address the task but does not cover all key features.',
    }
  },
  {
    id: 'cc',
    label: 'Coherence and Cohesion',
    description: 'The logical flow of your ideas and how well you use linking words.',
    scores: {
      9: 'Uses cohesion in such a way that it attracts no attention; skillfully manages paragraphing.',
      8: 'Sequences information and ideas logically; manages all aspects of cohesion well.',
      7: 'Logically organizes information and ideas; clear progression throughout.',
      6: 'Arranges information and ideas coherently; clear overall progression.',
      5: 'Presents information with some organization but there may be a lack of overall progression.',
      4: 'Presents information but this is not arranged logically; no clear progression.',
    }
  },
  {
    id: 'lr',
    label: 'Lexical Resource',
    description: 'The range and accuracy of your vocabulary.',
    scores: {
      9: 'Uses a wide range of vocabulary with very natural and sophisticated control of lexical features.',
      8: 'Uses a wide range of vocabulary fluently and flexibly to convey precise meanings.',
      7: 'Uses a sufficient range of vocabulary to allow some flexibility and precision.',
      6: 'Uses an adequate range of vocabulary for the task; some precision attempted.',
      5: 'Uses a limited range of vocabulary, but this is minimally adequate for the task.',
      4: 'Uses only basic vocabulary which may be used repetitively.',
    }
  },
  {
    id: 'gra',
    label: 'Grammatical Range',
    description: 'The complexity and accuracy of your sentence structures.',
    scores: {
      9: 'Uses a wide range of structures with full flexibility and accuracy; rare minor errors.',
      8: 'Uses a wide range of structures; majority of sentences are error-free.',
      7: 'Uses a variety of complex structures; produces frequent error-free sentences.',
      6: 'Uses a mix of simple and complex forms; some errors in grammar and punctuation.',
      5: 'Uses only a limited range of structures; frequent grammatical errors.',
      4: 'Uses only a very limited range of structures with only rare use of subordinate clauses.',
    }
  }
];

export const TASK2_CRITERIA = [
  {
    id: 'tr',
    label: 'Task Response',
    description: 'How well you address the task requirements in Task 2.',
    scores: {
      9: 'Fully addresses all parts of the task with a well-developed response.',
      8: 'Sufficiently addresses all parts of the task; well-developed response with relevant ideas.',
      7: 'Addresses all parts of the task; presents a clear position throughout.',
      6: 'Addresses all parts of the task; some parts may be more fully covered than others.',
      5: 'Addresses the task only partially; the format may be inappropriate in places.',
      4: 'Responds to the task only in a minimal way; small number of ideas.',
    }
  },
  {
    id: 'cc',
    label: 'Coherence and Cohesion',
    description: 'The logical flow of your ideas and how well you use linking words.',
    scores: {
      9: 'Uses cohesion in such a way that it attracts no attention; skillfully manages paragraphing.',
      8: 'Sequences information and ideas logically; manages all aspects of cohesion well.',
      7: 'Logically organizes information and ideas; clear progression throughout.',
      6: 'Arranges information and ideas coherently; clear overall progression.',
      5: 'Presents information with some organization but there may be a lack of overall progression.',
      4: 'Presents information but this is not arranged logically; no clear progression.',
    }
  },
  {
    id: 'lr',
    label: 'Lexical Resource',
    description: 'The range and accuracy of your vocabulary.',
    scores: {
      9: 'Uses a wide range of vocabulary with very natural and sophisticated control of lexical features.',
      8: 'Uses a wide range of vocabulary fluently and flexibly to convey precise meanings.',
      7: 'Uses a sufficient range of vocabulary to allow some flexibility and precision.',
      6: 'Uses an adequate range of vocabulary for the task; some precision attempted.',
      5: 'Uses a limited range of vocabulary, but this is minimally adequate for the task.',
      4: 'Uses only basic vocabulary which may be used repetitively.',
    }
  },
  {
    id: 'gra',
    label: 'Grammatical Range',
    description: 'The complexity and accuracy of your sentence structures.',
    scores: {
      9: 'Uses a wide range of structures with full flexibility and accuracy; rare minor errors.',
      8: 'Uses a wide range of structures; majority of sentences are error-free.',
      7: 'Uses a variety of complex structures; produces frequent error-free sentences.',
      6: 'Uses a mix of simple and complex forms; some errors in grammar and punctuation.',
      5: 'Uses only a limited range of structures; frequent grammatical errors.',
      4: 'Uses only a very limited range of structures with only rare use of subordinate clauses.',
    }
  }
];

export const BAND_SCORE_CRITERIA = TASK2_CRITERIA; // Legacy support
