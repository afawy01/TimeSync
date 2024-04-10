const request = require('supertest');
const app = require('../server'); // Adjust the path to where your server.js file is located

describe('Meeting Management', () => {
  // Test Environment 1.1: Creating a meeting
  describe('Meeting Scheduling', () => {
    it('should schedule a meeting and return a success message', async () => {
      // Define the meeting details to send in the request
      const meetingDetails = {
        title: 'Project Update Meeting',
        description: 'Discussing project progress and next steps.',

      };
  
      // Make a POST request to the /meeting route with the meeting details
      const response = await request(app)
        .post('/meeting') // Ensure this matches the route defined in your server.js
        .send(meetingDetails);
  
      // Check if the response status code is 200 (OK)
      expect(response.statusCode).toBe(200);
  
      // Verify the response body has a message indicating success
      expect(response.body).toHaveProperty('message', 'Meeting added');
  
      // Optionally, you can also check if an id is returned, indicating a meeting was added to the database
      expect(response.body).toHaveProperty('id');
    });
  });

  // Test Environment 2.1: Editing a meeting
  describe('Editing a meeting', () => {
    it('should allow a user to edit a meeting', async () => {
      const meeting = {
        Title: 'Drake',
        Description: 'Passionfruit',
        MeetingDate: '2024-04-11T12:00:00Z',
        UserID: '1',
        ChannelID: '1',
      };

      // Create a new meeting
      const createResponse = await request(app)
        .post('/meetings')
        .send(meeting);

      expect(createResponse.status).toBe(201);
      expect(createResponse.body).toMatchObject(meeting);

      // Edit the meeting
      const updatedMeeting = {
        Title: 'Drake',
        Description: 'Passionfruit',
        MeetingDate: '2024-04-11T12:00:00Z',
        UserID: '1',
        ChannelID: '1',
      };

      const editResponse = await request(app)
        .put(`/meetings/${createResponse.body.id}`)
        .send(updatedMeeting);

      expect(editResponse.status).toBe(200);
      expect(editResponse.body).toMatchObject(updatedMeeting);
    });
  });

  // Test Environment 2.2: Deleting a meeting
  describe('Deleting a meeting', () => {
    it('should allow a user to delete a meeting', async () => {
      const meeting = {
        Title: 'Drake',
        Description: 'Passionfruit',
        MeetingDate: '2024-04-11T12:00:00Z',
        UserID: '1',
        ChannelID: '1',
      };

      // Create a new meeting
      const createResponse = await request(app)
        .post('/meetings')
        .send(meeting);

      expect(createResponse.status).toBe(201);
      expect(createResponse.body).toMatchObject(meeting);

      // Delete the meeting
      const deleteResponse = await request(app)
        .delete(`/meetings/${createResponse.body.id}`);

      expect(deleteResponse.status).toBe(204);
    });
  });
});