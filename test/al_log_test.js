/* -----------------------------------------------------------------------------
 * @copyright (C) 2018, Alert Logic, Inc
 * @doc
 *
 * Tests for log data processing.
 *
 * @end
 * -----------------------------------------------------------------------------
 */

const assert = require('assert');
const sinon = require('sinon');
const alLog = require('../al_log');


describe('Unit Tests', function() {
    describe('Build log payload', function() {
        var clock;
        
        before(function(){
            clock = sinon.useFakeTimers();
        });
        after(function() {
            clock.restore();
        });

        it('Sunny case ', function(done) {
            var hostTypeElem = {
                key: 'host_type',
                value: {str: 'azure_fun'}
            };
            var localHostnameElem = {
                key: 'local_hostname',
                value: {str: 'somename'}
            };
            var hml = [localHostnameElem, hostTypeElem];
            var msgs = [
                'message1',
                'message2'
            ];
            
            var parseFun = function(m) {
                var messagePayload = {
                  messageTs: 1542138053,
                  priority: 11,
                  progName: 'o365webhook',
                  pid: undefined,
                  message: m,
                  messageType: 'json/azure.o365',
                  messageTypeId: 'AzureActiveDirectory',
                  messageTsUs: undefined
                };
                
                return messagePayload;
            };
            var expectedPayload = 'eJzjamHi4izOLy1KTtXNTBGK5mLPyC8uATFFdm6e97ZBfLqW665Nbkkbdic+E771WoJByYJLhosvJz85MScepDQvMTdViEuKozg/NxXE5pLg4gSJx5dUFqQKcUtxJlaVFqXGp5XmSfkIHtV4Hc3AwMAgy83AwKDEnW9sZlqempSRn59txJGbWlycmJ5qaMWfVZyfpw/WpgdS4STiCGI7JpdklqW6ZBalJpfkF1USZ5oRkaYBAFuCVYc=';
            const params = {
                    hostId: 'host-id',
                    sourceId: 'source-id',
                    hostmetaElems: hml,
                    content: msgs,
                    parseCallback: parseFun
            };
            alLog.buildPayload(params, function(err, payloadObject){
                assert.equal(expectedPayload, payloadObject.payload.toString('base64'));
                return done();
            });
        });

        it('Sunny case with JSON filter', function(done) {
            let hostTypeElem = {
                key: 'host_type',
                value: {str: 'azure_fun'}
            };
            let localHostnameElem = {
                key: 'local_hostname',
                value: {str: 'somename'}
            };
            let hml = [localHostnameElem, hostTypeElem];
            let msgs = [
                {message:'message1', prop: 'value1', filter: 'pass'},
                {message:'message2', prop: 'value2'},
                {message:'messagea', prop: 'valuea', filter: 'pass'}
            ];
            
            let parseFun = function(m) {
                let messagePayload = {
                  messageTs: 1542138053,
                  priority: 11,
                  progName: 'o365webhook',
                  pid: undefined,
                  message: JSON.stringify(m),
                  messageType: 'json/azure.o365',
                  messageTypeId: 'AzureActiveDirectory',
                  messageTsUs: undefined
                };
                
                return messagePayload;
            };
            let expectedPayload = 'eJzjesDExVmcX1qUnKqbmSIUzcWekV9cAmKK7Nw8722D+HQt112b3JI27E58JnzrtQSDkgWXDBdfTn5yYk48SGleYm6qEJcUR3F+biqIzSXBxQkSjy+pLEgV4pbiTKwqLUqNTyvNk6oSPKrxOpqBgYFBlpuBgUGJO9/YzLQ8NSkjPz/byKxaKTe1uDgxPVXJCsYyVNJRKijKL1CyUipLzCkF89Myc0pSi5SslAoSi4uVaq34s4rz8/TBluiBzHMScQSxHZNLMstSXTKLUpNL8osqSbc7Ec3uRLLtBgAWn3SI';
            const params = {
                    hostId: 'host-id',
                    sourceId: 'source-id',
                    hostmetaElems: hml,
                    content: msgs,
                    parseCallback: parseFun,
                    filterJson: {filter: 'pass'}
            };
            alLog.buildPayload(params, function(err, payloadObject){
                assert.equal(expectedPayload, payloadObject.payload.toString('base64'));
                return done();
            });
        });

        it('Sunny case with regexp filter', function(done) {
            let hostTypeElem = {
                key: 'host_type',
                value: {str: 'azure_fun'}
            };
            let localHostnameElem = {
                key: 'local_hostname',
                value: {str: 'somename'}
            };
            let hml = [localHostnameElem, hostTypeElem];
            let msgs = [
                'message1',
                'message2',
                'messagea'
            ];
            
            let parseFun = function(m) {
                let messagePayload = {
                  messageTs: 1542138053,
                  priority: 11,
                  progName: 'o365webhook',
                  pid: undefined,
                  message: m,
                  messageType: 'json/azure.o365',
                  messageTypeId: 'AzureActiveDirectory',
                  messageTsUs: undefined
                };
                
                return messagePayload;
            };
            let expectedPayload = 'eJzjamHi4izOLy1KTtXNTBGK5mLPyC8uATFFdm6e97ZBfLqW665Nbkkbdic+E771WoJByYJLhosvJz85MScepDQvMTdViEuKozg/NxXE5pLg4gSJx5dUFqQKcUtxJlaVFqXGp5XmSfkIHtV4Hc3AwMAgy83AwKDEnW9sZlqempSRn59txJGbWlycmJ5qaMWfVZyfpw/WpgdS4STiCGI7JpdklqW6ZBalJpfkF1USZ5oRkaYBAFuCVYc=';
            const params = {
                    hostId: 'host-id',
                    sourceId: 'source-id',
                    hostmetaElems: hml,
                    content: msgs,
                    parseCallback: parseFun,
                    filterRegexp: 'message[0-9]'
            };
            alLog.buildPayload(params, function(err, payloadObject){
                assert.equal(expectedPayload, payloadObject.payload.toString('base64'));
                return done();
            });
        });

        it('Too many messages ', function(done) {
            this.timeout(5000);
            var hostTypeElem = {
                key: 'host_type',
                value: {str: 'azure_fun'}
            };
            var localHostnameElem = {
                key: 'local_hostname',
                value: {str: 'somename'}
            };
            var hml = [localHostnameElem, hostTypeElem];
            var msgs = [];
            for (let i=0; i<70000; i++){
                msgs.push('very-long-message' + Math.random());
            }
            
            var parseFun = function(m) {
                var messagePayload = {
                  messageTs: 1542138053,
                  priority: 11,
                  progName: 'o365webhook',
                  pid: undefined,
                  message: m,
                  messageType: 'json/azure.o365',
                  messageTypeId: 'AzureActiveDirectory',
                  messageTsUs: undefined
                };
                // Let's make a message bigger
                messagePayload.message = JSON.stringify(messagePayload);
                return messagePayload;
            };
            
            const params = {
                    hostId: 'host-id',
                    sourceId: 'source-id',
                    hostmetaElems: hml,
                    content: msgs,
                    parseCallback: parseFun
            };
            alLog.buildPayload(params, function(err, payload){
                sinon.match(err, 'Maximum payload size exceeded');
                return done();
            });
        });

        it('Wrong hostmeta build error ', function(done) {
            var hostTypeElem = {
                value: {str: 'azure_fun'}
            };
            var localHostnameElem = {
                key: 'local_hostname',
                value: {str: 'somename'}
            };
            var hml = [localHostnameElem, hostTypeElem];
            var msgs = [
                'message1',
                'message2'
            ];
            
            var parseFun = function(m) {
                var messagePayload = {
                  messageTs: 1542138053,
                  priority: 11,
                  progName: 'o365webhook',
                  pid: undefined,
                  message: m,
                  messageType: 'json/azure.o365',
                  messageTypeId: 'AzureActiveDirectory',
                  messageTsUs: undefined
                };
                
                return messagePayload;
            };
            
            const params = {
                    hostId: 'host-id',
                    sourceId: 'source-id',
                    hostmetaElems: hml,
                    content: msgs,
                    parseCallback: parseFun
            };
            alLog.buildPayload(params, function(err, payload){
                assert.equal(err, 'elem.key: string expected');
                return done();
            });
        });

        it('Wrong pasred message build error ', function(done) {
            var localHostnameElem = {
                key: 'local_hostname',
                value: {str: 'somename'}
            };
            var hml = [localHostnameElem];
            var msgs = [
                'message1',
                'message2'
            ];
            
            var parseFun = function(m) {
                var messagePayload = {
                  //messageTs: 1542138053,
                  priority: 11,
                  progName: 'o365webhook',
                  pid: undefined,
                  message: m,
                  messageType: 'json/azure.o365',
                  messageTypeId: 'AzureActiveDirectory',
                  messageTsUs: undefined
                };
                
                return messagePayload;
            };
            
            const params = {
                    hostId: 'host-id',
                    sourceId: 'source-id',
                    hostmetaElems: hml,
                    content: msgs,
                    parseCallback: parseFun
            };
            alLog.buildPayload(params, function(err, payload){
                assert.equal(err, 'messageTs: integer|Long expected');
                return done();
            });
        });

    });
});
