const schedule = require('node-schedule');

exports.test = async (req, res)=>{
    const startTime = new Date();
const endTime = new Date(startTime.getMinutes + 0.5);
const job = schedule.scheduleJob({ start: '2021-07-07T01:29:30.000Z', end: '2021-07-07T01:30:30.000Z'}, function(){
  console.log('Hey');
});
 return res.status(200).json({message:'Hey'})
}