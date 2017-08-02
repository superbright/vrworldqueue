const bays = [
  {
    bayid: 0
    , name: 'A-1'
    , game: 'Plank'
    , playTime: 5
    , instructionFile: '/images/instructions/a_1.png'
    , }
  , {
    bayid: 1
    , name: 'A-2'
    , game: 'Serious Sam'
    , playTime: 10
    , instructionFile: '/images/instructions/serious_sam.png'
    , bigBayImageFile: '/images/bigbay/serioussambranded.png'
    , }
  , {
    bayid: 2
    , name: 'A-3'
    , game: 'Tilt Brush'
    , playTime: 8
    , instructionFile: '/images/instructions/tilt_brush.png'
    , bigBayImageFile: '/images/bigbay/tiltbrushbranded.png'
    , }
  , {
    bayid: 3
    , name: 'A-4A'
    , game: 'Icaros'
    , playTime: 10
    , instructionFile: '/images/instructions/a_4a.png'
    , }
  , {
    bayid: 4
    , name: 'A-4B'
    , game: 'Icaros'
    , playTime: 10
    , instructionFile: '/images/instructions/a_4b.png'
    , }
  , {
    bayid: 5
    , name: 'A-5'
    , game: 'Space Pirate Trainer'
    , playTime: 8
    , instructionFile: '/images/instructions/space_pirate_trainer.png'
    , bigBayImageFile: '/images/bigbay/spacepiratebranded.png'
    , }
  , {
    bayid: 6
    , name: 'A-6A'
    , game: 'Dirt'
    , playTime: 10
    , instructionFile: '/images/instructions/a_6a.png'
    , }
  , {
    bayid: 7
    , name: 'A-6B'
    , game: 'Dirt'
    , playTime: 10
    , instructionFile: '/images/instructions/a_6b.png'
    , }
  , {
    bayid: 8
    , name: 'A-6C'
    , game: 'Dirt'
    , playTime: 10
    , instructionFile: '/images/instructions/a_6c.png'
  }
  , {
    bayid: 9
    , name: 'A-6D'
    , game: 'Dirt'
    , playTime: 10
    , instructionFile: '/images/instructions/a_6d.png'
  }
  , {
    bayid: 10
    , name: 'A-7'
    , game: 'VR Skeet Shooter'
    , playTime: 6
    , instructionFile: '/images/instructions/skeet_shooter.png'
    , bigBayImageFile: '/images/bigbay/skeetshooterbranded.png'
  }
  , {
    bayid: 11
    , name: 'A-8'
    , game: 'I Expect You to Die'
    , playTime: 8
    , instructionFile: '/images/instructions/i_expect_you_to_die.png'
    , bigBayImageFile: '/images/bigbay/iexpectyoutodiebranded.png'
  }
  , {
    bayid: 12
    , name: 'A-9'
    , game: 'Lucky\'s Tale'
    , playTime: 6
    , instructionFile: '/images/instructions/luckys_tale.png'
    , bigBayImageFile: '/images/bigbay/luckystalebranded.png'
  }
  , {
    bayid: 13
    , name: 'B-1'
    , game: 'Brookhaven'
    , playTime: 10
    , instructionFile: '/images/instructions/brookhaven.png'
    , bigBayImageFile: '/images/bigbay/brookhavenbranded.png'
  }
  , {
    bayid: 14
    , name: 'B-2A'
    , game: 'Raw Data'
    , playTime: 12
    , instructionFile: '/images/instructions/raw_data.png'
    , bigBayImageFile: '/images/bigbay/rawdatabranded.png'
  }
  , {
    bayid: 15
    , name: 'B-2B'
    , game: 'Raw Data'
    , playTime: 12
    , instructionFile: '/images/instructions/raw_data.png'
    , bigBayImageFile: '/images/bigbay/rawdatabranded.png'
  }
  , {
    bayid: 16
    , name: 'B-3'
    , game: 'Thrill of the Fight'
    , playTime: 7
    , instructionFile: '/images/instructions/thrill_of_the_fight.png'
    , }
  , {
    bayid: 17
    , name: 'B-4'
    , game: 'Fruit Ninja'
    , playTime: 5
    , instructionFile: '/images/instructions/fruit_ninja.png'
    , bigBayImageFile: '/images/bigbay/fruitninjabranded.png'
  }
  , {
    bayid: 18
    , name: 'B-5'
    , game: 'Elven Assassin'
    , playTime: 8
    , instructionFile: '/images/instructions/elven_assassin.png'
    , bigBayImageFile: '/images/bigbay/elvenassassinbranded.png'
  }
  , {
    bayid: 19
    , name: 'B-6'
    , game: 'Space Pirate Trainer'
    , playTime: 6
    , instructionFile: '/images/instructions/space_pirate_trainer.png'
    , bigBayImageFile: '/images/bigbay/spacepiratebranded.png'
  }
  , {
    bayid: 20
    , name: 'B-7'
    , game: 'Superhot'
    , playTime: 11
    , instructionFile: '/images/instructions/superhot.png'
    , bigBayImageFile: '/images/bigbay/superhotbranded.png'
  }
  , {
    bayid: 21
    , name: 'B-8'
    , game: 'The Climb'
    , playTime: 8
    , instructionFile: '/images/instructions/the_climb.png'
    , bigBayImageFile: '/images/bigbay/theclimbbranded.png'
  }
  , {
    bayid: 22
    , name: 'B-9'
    , game: 'Rick & Morty'
    , playTime: 8
    , instructionFile: '/images/instructions/b_9.png'
  }
  , {
    bayid: 23
    , name: 'B-10'
    , game: 'Job Simulator'
    , playTime: 8
    , instructionFile: '/images/instructions/job_simulator.png'
    , bigBayImageFile: '/images/bigbay/jobsimulatorbranded.png'
  }
  , {
    bayid: 24
    , name: 'B-11'
    , game: 'Tilt Brush'
    , playTime: 7
    , instructionFile: '/images/instructions/tilt_brush.png'
    , bigBayImageFile: '/images/bigbay/tiltbrushbranded.png'
    , }
  , {
    bayid: 25
    , name: 'B-12'
    , game: 'Thumper'
    , playTime: 8
    , instructionFile: '/images/instructions/thumper.png'
    , bigBayImageFile: '/images/bigbay/thumperbranded.png'
    , }
  , {
    bayid: 26
    , name: 'B-13'
    , game: 'Dear Angelica'
    , playTime: 10
    , instructionFile: '/images/instructions/b_13.png'
    , }
  , {
    bayid: 27
    , name: 'B-14'
    , game: 'Night Cafe'
    , playTime: 10
    , instructionFile: '/images/instructions/b_14.png'
    , }
  , {
    bayid: 28
    , name: 'B-15'
    , game: 'Henry'
    , playTime: 10
    , instructionFile: '/images/instructions/b_15.png'
    , }
  , {
    bayid: 29
    , name: 'M-1A'
    , game: 'Project Cars'
    , playTime: 10
    , instructionFile: '/images/instructions/m_1a.png'
    , }
  , {
    bayid: 30
    , name: 'M-1B'
    , game: 'Tilt Brush'
    , playTime: 10
    , instructionFile: '/images/instructions/m_1b.png'
    , }
  , {
    bayid: 31
    , name: 'M-2A'
    , game: ''
    , playTime: 10
    , instructionFile: '/images/instructions/m_2a.png'
    , }
  , {
    bayid: 32
    , name: 'M-2B'
    , game: ''
    , playTime: 10
    , instructionFile: '/images/instructions/m_2b.png'
    , }
  , {
    bayid: 33
    , name: 'M-2C'
    , game: ''
    , playTime: 10
    , instructionFile: '/images/instructions/m_2c.png'
    , }
  , {
    bayid: 34
    , name: 'M-2D'
    , game: ''
    , playTime: 10
    , instructionFile: '/images/instructions/m_2d.png'
    , }
  , {
    bayid: 35
    , name: 'M-2E'
    , game: ''
    , playTime: 10
    , instructionFile: '/images/instructions/m_2e.png'
    , }
  , {
    bayid: 36
    , name: 'M-2F'
    , game: ''
    , playTime: 10
    , instructionFile: '/images/instructions/m_2f.png'
    , }
  , {
    bayid: 37
    , name: 'M-3A'
    , game: ''
    , playTime: 10
    , instructionFile: '/images/instructions/m_3a.png'
    , }
  , {
    bayid: 38
    , name: 'M-3B'
    , game: ''
    , playTime: 10
    , instructionFile: '/images/instructions/m_3b.png'
    , }
  , {
    bayid: 39
    , name: 'M-3C'
    , game: ''
    , playTime: 10
    , instructionFile: '/images/instructions/m_3c.png'
    , }
  , {
    bayid: 40
    , name: 'M-3D'
    , game: ''
    , playTime: 10
    , instructionFile: '/images/instructions/m_3d.png'
    , }
  , {
    bayid: 41
    , name: 'M-3E'
    , game: ''
    , playTime: 10
    , instructionFile: '/images/instructions/m_3e.png'
    , }
  , {
    bayid: 42
    , name: 'M-3F'
    , game: ''
    , playTime: 10
    , instructionFile: '/images/instructions/m_3f.png'
    , }
  , {
    bayid: 43
    , name: 'M-4A'
    , game: ''
    , playTime: 10
    , instructionFile: '/images/instructions/m_4a.png'
    , }
  , {
    bayid: 44
    , name: 'M-4B'
    , game: ''
    , playTime: 10
    , instructionFile: '/images/instructions/m_4b.png'
    , }
  , {
    bayid: 45
    , name: 'M-4C'
    , game: ''
    , playTime: 10
    , instructionFile: '/images/instructions/m_4c.png'
    , }
  , {
    bayid: 46
    , name: 'M-4D'
    , game: ''
    , playTime: 10
    , instructionFile: '/images/instructions/m_4d.png'
    , }
  , {
    bayid: 47
    , name: 'M-4E'
    , game: ''
    , playTime: 10
    , instructionFile: '/images/instructions/m_4e.png'
    , }
  , {
    bayid: 48
    , name: 'M-4F'
    , game: ''
    , playTime: 10
    , instructionFile: '/images/instructions/m_4f.png'
    , }
  , ];

module.exports = {
  bays,
};