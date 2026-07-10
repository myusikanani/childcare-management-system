export const mockData = {
  // Children data
  children: [
    {
      id: 1,
      name: 'Mily Rose',
      age: 4,
      allergies: 'Peanut, Bee Stings',
      parentId: 1,
      caretakerId: 1,
      status: 'happy',
      avatar: '👧',
      activities: {
        meals: { completed: true, time: '12:30 PM' },
        napTime: { completed: true, time: '2:00 PM', duration: '1h 30m' },
        play: { completed: false, time: '-' }
      },
      attendance: 'present'
    },
    {
      id: 2,
      name: 'Emma',
      age: 3,
      parentId: 2,
      caretakerId: 1,
      status: 'happy',
      avatar: '👶',
      attendance: 'present'
    },
    {
      id: 3,
      name: 'Liam',
      age: 5,
      parentId: 3,
      caretakerId: 2,
      status: 'sleeping',
      avatar: '👦',
      attendance: 'present'
    },
    {
      id: 4,
      name: 'Aidan',
      age: 3,
      parentId: 4,
      caretakerId: 2,
      status: 'sleeping',
      avatar: '👶',
      attendance: 'present'
    },
    {
      id: 5,
      name: 'Aiden',
      age: 4,
      parentId: 5,
      caretakerId: 3,
      status: 'playing',
      avatar: '👦',
      attendance: 'present'
    }
  ],

  // Parent data
  parents: [
    {
      id: 1,
      name: 'Mily Rose',
      email: 'mily.rose@email.com',
      phone: '04 123',
      childrenIds: [1]
    }
  ],

  // Caretaker data
  caretakers: [
    {
      id: 1,
      name: 'Emma Johnson',
      childrenCount: 2
    },
    {
      id: 2,
      name: 'Sarah Williams',
      childrenCount: 2
    },
    {
      id: 3,
      name: 'Michael Brown',
      childrenCount: 1
    }
  ],

  // Statistics
  stats: {
    happyKids: 500,
    activities: 50,
    teachers: 10,
    locations: 10
  },

  // Live updates
  liveUpdates: [
    {
      id: 1,
      childName: 'Lily',
      activity: 'Playing in the yard',
      time: '10 mins ago',
      avatar: '👧'
    },
    {
      id: 2,
      childName: 'Lucas',
      activity: 'Sleeping',
      time: '25 mins ago',
      avatar: '👦'
    },
    {
      id: 3,
      childName: 'Oliver',
      activity: 'Happy in class',
      time: '40 mins ago',
      avatar: '👶'
    },
    {
      id: 4,
      childName: 'Oliver',
      activity: 'tucking in the cot',
      time: '1 hour ago',
      avatar: '👶'
    }
  ],

  // Testimonials
  testimonials: [
    {
      id: 1,
      icon: '🛡️',
      title: 'Safe',
      description: 'Latest cause find educationalists Well-loved by passionate volunteers'
    },
    {
      id: 2,
      icon: '💚',
      title: 'Caring',
      description: 'They gave us providing amazing offers users in unlimited greatfuls'
    },
    {
      id: 3,
      icon: '🧠',
      title: 'Smart',
      description: 'Latest thing permanent colors customizing rich interface it digitize'
    }
  ],

  // Enrollment data
  enrollmentData: {
    months: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
    values: [30, 45, 35, 50, 40, 55]
  },

  // Staff distribution
  staffDistribution: {
    teachers: 40,
    assistants: 30,
    admin: 20,
    support: 10
  }
};

export const statusColors = {
  happy: '#66D9A8',
  sleeping: '#5AB8E8',
  playing: '#A094E4',
  sick: '#FF6B6B'
};

export const activityIcons = {
  meals: '🍽️',
  napTime: '😴',
  play: '🎮',
  art: '🎨',
  music: '🎵',
  outdoor: '🌳'
};