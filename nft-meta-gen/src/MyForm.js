import React, { useState, useEffect } from 'react';
import { Octokit } from '@octokit/rest';
import { SHA256 } from 'crypto-js';
import './MyForm.css';
import Web3 from 'web3';
import contractABI from './contractABI.json';

const contractAddress = '0xe87345020E1CB815FC5ACb6D11a44243D45467cD';

const web3 = new Web3(window.ethereum);

const contract = new web3.eth.Contract(contractABI, contractAddress);

const MyForm = () => {
    const [location, setLocation] = useState('');
    const [date, setDate] = useState('');
    const [time, setTime] = useState('');
    const [noHumanRightsViolation, setNoHumanRightsViolation] = useState(false);
    const [noChildLabor, setNoChildLabor] = useState(false);
    const [co2Footprint, setCo2Footprint] = useState('');
    const [currentSha, setCurrentSha] = useState('');
    const octokit = new Octokit({ auth: process.env.REACT_APP_GITHUB_TOKEN });
    const repoOwner = 'niranjangirhe';
    const repoName = 'NFT-Metadata-Generator';
    const filePath = 'contents/';
    const [jsonData, setJsonData] = useState(null);
    const [rawUrl, setRawUrl] = useState('');
    const [sha256, setSha256] = useState('');
    const [address, setAddress] = useState('');
    const [blockNumber, setBlockNumber] = useState('');
    const [txHash, setTxHash] = useState('');
    const [connectionStatus, setConnectionStatus] = useState(false);
    const [etherscanLink, setEtherscanLink] = useState('');
    // const [logs, setLogs] = useState('');


    async function handleConnect() {
        if (window.ethereum) {
            try {
                await window.ethereum.request({ method: "eth_requestAccounts" });
                setConnectionStatus(true);
            } catch (error) {
                console.error(error);
                setConnectionStatus(false);
            }
        } else {
            console.error("Please install Metamask");
        }
    }

    var gettime = Date.now();



    useEffect(() => {

        fetchCurrentSha(); // Fetch the current SHA on component mount
    }, []);

    const fetchCurrentSha = async () => {
        gettime = Date.now();
        try {
            const response = await octokit.repos.getContent({
                owner: repoOwner,
                repo: repoName,
                path: filePath+'data'+gettime+'.json',
            });

            setCurrentSha(response.data.sha);
        } catch (error) {
            console.error('Error fetching current SHA:', error);
        }
    };


    const handleSubmit = async (e) => {
        e.preventDefault();

        // Create JSON object
        const formData = {
            location,
            date,
            time,
            noHumanRightsViolation,
            noChildLabor,
            co2Footprint,
        };

        // Make a commit on GitHub

        try {
            console.log('Creating commit...');
            const response = await octokit.repos.createOrUpdateFileContents({
                owner: repoOwner,
                repo: repoName,
                path: filePath+'data'+gettime+'.json',
                message: 'Add form data',
                content: btoa(JSON.stringify(formData, null, 2)),
                sha: currentSha,
            });

            console.log('Commit created:', response.data);
            setJsonData(formData); // Store the form data in state
            setRawUrl(response.data.content.download_url); // Set the raw URL
            const jsonStr = JSON.stringify(formData);
            const hash = SHA256(jsonStr).toString();
            setSha256(hash);
            fetchCurrentSha();
            setLocation('');
            setDate('');
            setTime('');
            setNoHumanRightsViolation(false);
            setNoChildLabor(false);
            setCo2Footprint('');
            setAddress('');


            const receipt = await contract.methods.safeMint(address, response.data.content.download_url).send({ from: window.ethereum.selectedAddress });
            setBlockNumber(receipt.blockNumber);
            setTxHash(receipt.transactionHash);
            setEtherscanLink(`https://sepolia.etherscan.io/tx/${receipt.transactionHash}`);


        } catch (error) {
            console.error('Error creating commit:', error);
        }
    };
    const handleCopy = (text) => {
        navigator.clipboard.writeText(text);
    };

    const handleRedirect = (url) => {
        //redirect to url passed in.
        //write code to open url in new tab
        window.open(url, "_blank");
    }

    return (
        <div className="wrapper">
            <h1 className="title">NFT Metadata Generator</h1>
            <p className="description">Fill out the form below to generate NFT metadata.</p>
            <p className="description">The metadata will be stored in a GitHub repo and minted as an NFT.</p>
            <div>
                <p>More at GitHub <a href='https://github.com/niranjangirhe/NFT-Metadata-Generator.git'>link</a></p>
            </div>
            <button className='button' onClick={() => handleConnect()}>{connectionStatus ? 'Connected' : 'Connect to metamask'}</button>
            <form onSubmit={handleSubmit} className="form-container">
                <div className="form-row">
                    <label className="form-label">
                        Location:
                        <input type="text" className="form-input" value={location} onChange={(e) => setLocation(e.target.value)} />
                    </label>
                </div>
                <div className="form-row">
                    <label className="form-label">
                        Date:
                        <input type="date" className="form-input" value={date} onChange={(e) => setDate(e.target.value)} />
                    </label>
                </div>
                <div className="form-row">
                    <label className="form-label">
                        Time:
                        <input type="time" className="form-input" value={time} onChange={(e) => setTime(e.target.value)} />
                    </label>
                </div>
                <div className="form-row">
                    <label className="form-label">
                        No Human Rights Violation:
                        <input
                            type="checkbox"
                            className="form-checkbox"
                            checked={noHumanRightsViolation}
                            onChange={(e) => setNoHumanRightsViolation(e.target.checked)}
                        />
                    </label>
                    <label className="form-label">
                        No Child Labor:
                        <input
                            type="checkbox"
                            className="form-checkbox"
                            checked={noChildLabor}
                            onChange={(e) => setNoChildLabor(e.target.checked)}
                        />
                    </label>
                </div>
                <div className="form-row">
                    <label className="form-label">
                        CO2 Footprint:
                        <input
                            type="number"
                            className="form-input"
                            value={co2Footprint}
                            onChange={(e) => setCo2Footprint(e.target.value)}
                        />
                    </label>
                </div>
                <div className="form-row">
                    <label className="form-label">
                        Wallet address to whom the NFT will be minted:
                        <input type="text" className="form-input" value={address} onChange={(e) => setAddress(e.target.value)} />
                    </label>
                </div>
                <div className="form-row">
                    <button type="submit" className="submit-button">Safe Mint</button>
                </div>
            </form>
            {jsonData && (
                <div className="json-container">
                    <h2>JSON Content:</h2>
                    <pre>{JSON.stringify(jsonData, null, 2)}</pre>

                    <div className="url-sha-container">
                        <div className="url-row">
                            <span className="label">Raw URL/URI:</span>
                            <span className="text">{rawUrl}</span>
                            <button className="copy-button" onClick={() => handleCopy(rawUrl)}>
                                Copy
                            </button>
                        </div>
                        <div className="json-row">
                            <span className="label">Data:</span>
                            <span className="text">{JSON.stringify(jsonData)}</span>
                            <button className="copy-button" onClick={() => handleCopy(JSON.stringify(jsonData))}>
                                Copy
                            </button>
                        </div>
                        <div className="sha-row">
                            <span className="label">SHA256:</span>
                            <span className="text">{sha256}</span>
                            <button className="copy-button" onClick={() => handleCopy(sha256)}>
                                Copy
                            </button>
                        </div>
                        <div className="sha-row">
                            <span className="label">blockNumber:</span>
                            <span className="text">{blockNumber ? blockNumber : 'Waiting...'}</span>

                        </div>
                        <div className="sha-row">
                            <span className="label">txHash:</span>
                            <span className="text">{txHash ? txHash : 'Waiting...'}</span>

                        </div>
                        <div className="sha-row">
                            <span className="label">View on Etherscan:</span>
                            <span className="text">{etherscanLink}</span>
                            <button className="copy-button" onClick={() => handleRedirect(etherscanLink)}>
                                {txHash ? 'Redirect' : 'Waiting...'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default MyForm;