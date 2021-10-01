require('dotenv').config();
const axios = require('axios');
const querystring = require('querystring');

const pickDateList = ['9/27, 10/4, 10/11, 10/18, 10/25, 11/1, 11/8, 11/15, 11/22, 12/03']
const winner_url = 'https://www.kc-foods.com/20210920flavoredmilk/winner.aspx';

(async ()=>{
    if (!(checkDate())) return;
    const invoiceList = process.env.INVOICE_LIST.split(',');
    if(invoiceList.length <= 0){
        console.error('You don\'t input your invoice in env variable');
        return;
    }
    const {data} = await axios.get(winner_url);
    const winner_invoice_list = [];
    invoiceList.forEach((invoice)=>{
        if(data.includes(invoice)) winner_invoice_list.push(invoice);
    });
    const notifyMsg = (winner_invoice_list.length>0) ?
        `\n中了!!! \n發票號碼清單為:\n${winner_invoice_list.join('\n')}\n可查看此網址:\n${winner_url}` :
        `\n沒中 QQ \n您目前的發票號碼清單為:\n${invoiceList.join('\n')}\n可查看此網址:\n${winner_url}` ;
    sendLineNotify(notifyMsg);
})();


function checkDate(){
    const currentDate = new Date();
    // const currentMonth = parseInt(currentDate.getMonth());
    // const currentDay = parseInt(currentDate.getDay());
    const currentMonth = 9;
    const currentDay = 28;

    for(let pickDate of pickDateList){
        const pickArray = pickDate.split('/')
        const pickMonth = parseInt(pickArray[0]);
        const pickDay = parseInt(pickArray[1])+1;
        if(currentMonth === pickMonth && currentDay === pickDay) return true;
    }
    console.error(`Date is not yet, now is ${currentMonth}/${currentDay}`)
    return false
};

async function sendLineNotify(messageContent){
    if(!(process.env.LINE_NOTIFY_TOKEN)){
        console.error(`LINE_NOTIFY_TOKEN not fund in env variale`)
        return
    }
    const options = {
        method: 'post',
        url: 'https://notify-api.line.me/api/notify',
        headers: {
          'Authorization': `Bearer ${process.env.LINE_NOTIFY_TOKEN}`,
          'Content-Type': 'application/x-www-form-urlencoded',
          'Access-Control-Allow-Origin': '*'
        },
        data: querystring.stringify({
          message: messageContent,
        })
    };
    try{
        const resp = await axios(options);
        console.log('Send line notify success');
    }
    catch (error){
        console.error(`Send line notify fail and get the error is:\n${JSON.stringify(error.response.data)}`);
    }
};