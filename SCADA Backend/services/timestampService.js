exports.timestampService = async()=>{
    try{

       let timestamp = new Date();
       let date = timestamp.getDate();
       let month = timestamp.getMonth()+1;
       let year = timestamp.getFullYear();
       let hour = timestamp.getHours();
       let minute = timestamp.getMinutes();
       let second = timestamp.getSeconds();
       let response = year+'-'+month+'-'+date+' '+hour+':'+minute+':'+second;
       return  { status:true, response:response };
    }
    catch(err){
        //console.log(err);
        const response ={
            status: false,
            message: err.message
        }
        return response;
    }
}