import "./App.css";
import Form from "react-bootstrap/Form";
import Button from "react-bootstrap/Button";
import Row from "react-bootstrap/Row";
import Col from "react-bootstrap/Col";
import Container from "react-bootstrap/Container";
import Image from "react-bootstrap/Image";
import Accordion from "react-bootstrap/Accordion";
import Card from 'react-bootstrap/Card';
import OverlayTrigger from 'react-bootstrap/OverlayTrigger';
import Popover from 'react-bootstrap/Popover';


import Tab from "react-bootstrap/Tab";
import Tabs from "react-bootstrap/Tabs";
import React, { useState, useEffect } from "react";
import axios from "axios";
import * as JSZip from 'jszip';
import { saveAs } from 'file-saver';

const isImage = (file) => file['type'].includes('image');
const isText = (file) => file['type'].includes('text');

function NewlineText(props) {
    const text = props.text;
    const newText = text.split("\n").map((str, index) => (
        <p className="mb-0" key={index}>
            {str}
        </p>
    ));
    return newText;
}

function DisplayImages(props) {
    let imgRenders;
    let downloadButton;

    if (props.imgUploads) {
        downloadButton = (
            <Row className="justify-content-center">
                <Col xs="auto">
                    <Button variant="secondary" onClick={() => handleDownload(props.imgUploads)}>
                        Download OCR Outputs
                    </Button>
                </Col>
            </Row>
        );
        console.log("Uploads exists");
        imgRenders = props.imgUploads.map((img) => {
            return (
                <Accordion.Item eventKey={img["key"]} key={img["key"]}>
                    <Accordion.Header>{img["key"]}</Accordion.Header>
                    <Accordion.Body>
                        <Row>
                            <Col>
                                <Image src={img["url"]} className="img-fluid"></Image>
                            </Col>
                            <Col>
                                <NewlineText text={img["text"]} />
                            </Col>
                        </Row>
                    </Accordion.Body>
                </Accordion.Item>
            );
        });
    }

    function handleDownload(imgUploads) {
        var zip = new JSZip();
        let elements = [];
        for (let i = 0; i < imgUploads.length; i++) {
            zip.file(imgUploads[i]["key"].replace(/\.[^/.]+$/, "") + ".txt", imgUploads[i]["text"]);
            // const element = document.createElement("a");
            // const file = new Blob([imgUploads[i]["text"]], { type: "text/plain" });
            // element.href = URL.createObjectURL(file);
            // element.download = imgUploads[i]["key"].replace("png", "txt");
            // elements[i] = element;
        }
        console.log(elements);

        /*
        for (let i = 0; i < elements.length; i++) {
            document.body.appendChild(elements[i]);
            elements[i].click();
            document.body.removeChild(elements[i]);
        }
        */
        zip.generateAsync({ type: "base64" }).then(function (base64) {
            window.location.href = "data:application/zip;base64," + base64;
        });
        console.log("done");
    }

    return (
        <>
            <Row className="my-2">{downloadButton}</Row>
            <Row>
                <Accordion defaultActiveKey="-1">{imgRenders}</Accordion>
            </Row>
        </>
    );
}

function OCRForm(props) {
    const { email, setEmail } = React.useContext(AppContext);
    const popover_ocr = (
        <Popover id="popover-basic">
            <Popover.Header as="h3">Select OCR engine</Popover.Header>
            <Popover.Body>
                Currently only Google Vision is supported.
            </Popover.Body>
        </Popover>
    );
    const popover_files = (
        <Popover id="popover-basic">
            <Popover.Header as="h3">Upload image files</Popover.Header>
            <Popover.Body>
                All common image file formats are supported. If you upload 3 or more images, the job will run in the background and an email with the output will be sent when it finishes.
            </Popover.Body>
        </Popover>
    );
    return (
        <Form className="my-4" onSubmit={props.handleSubmit}>
            <Row>
                <Col xs="auto">
                    <OverlayTrigger trigger="hover" delay={{ show: 250, hide: 400 }} placement="left" overlay={popover_ocr}>
                    <Form.Select onChange={props.handleSystemSelect}>
                        {/* <option value="" disabled>Choose an OCR system</option> */}
                        <option value="google">Google Vision</option>
                        <option value="tesseract" disabled>Tesseract</option>
                    </Form.Select>
                    </OverlayTrigger>
                </Col>
                <Col xs="auto">
                    <Form.Group controlId="fileUploader">
                        <OverlayTrigger trigger="hover" delay={{ show: 250, hide: 400 }} placement="left" overlay={popover_files}>
                        <Form.Control type="file" multiple="multiple" onChange={props.handleFileSelect} accept="image/*" required={true} title=""/>
                        </OverlayTrigger>
                        <Form.Label className="mt-2">Image files to transcribe</Form.Label>
                    </Form.Group>
                </Col>
                <Col xs="auto" className="d-none">
                    <Form.Group className="d-none" controlId="emailAddress">
                        <Form.Control type="email" onChange={props.handleEmailChange} required={true} defaultValue={email}/>
                        <Form.Label className="mt-2">Email Address</Form.Label>
                    </Form.Group>
                </Col>
                <Col xs="auto">
                    <Button variant="primary" type="submit">
                        Upload
                    </Button>
                </Col>
            </Row>
        </Form>
    );
}

function PostCorrInferenceForm(props) {
    const { email, setEmail } = React.useContext(AppContext);
    const popover_test = (
        <Popover id="popover-basic">
            <Popover.Header as="h3">Upload test data</Popover.Header>
            <Popover.Body>
                Upload first-pass OCR output files to correct. Files should be in plain txt format.
            </Popover.Body>
        </Popover>
    );
    const popover_modelid = (
        <Popover id="popover-basic">
            <Popover.Header as="h3">Specify model ID</Popover.Header>
            <Popover.Body>
                Please specify a model ID from the list of available models.
            </Popover.Body>
        </Popover>
    );
    return (
        <Form className="my-4" onSubmit={props.handleSubmit}>
            <Row>
                <Col xs="auto">
                    <Form.Group controlId="testData">
                        <OverlayTrigger trigger="hover" delay={{ show: 250, hide: 400 }} placement="top" overlay={popover_test}>
                        <Form.Control type="file" multiple="multiple" onChange={props.handleTestDataSelect} accept="text/plain" required={true} title=""/>
                        </OverlayTrigger>
                        <Form.Label className="mt-2">Test data (plain text files)</Form.Label>
                    </Form.Group>
                </Col>
                <Col xs="auto">
                    <Form.Group controlId="modelId">
                        <OverlayTrigger trigger="hover" delay={{ show: 250, hide: 400 }} placement="top" overlay={popover_modelid}>
                        <Form.Control type="text" onChange={props.handleModelIDChange} required={true} title=""/>
                        </OverlayTrigger>
                        <Form.Label className="mt-2">Model ID</Form.Label>
                    </Form.Group>
                    <a target="_blank" href="/annotator/home/#models">List of available models</a>
                </Col>
                <Col xs="auto" className="d-none">
                    <Form.Group className="d-none" controlId="emailAddress">
                        <Form.Control type="email" onChange={props.handleEmailChange} required={true} defaultValue={email}/>
                        <Form.Label className="mt-2">Email Address</Form.Label>
                    </Form.Group>
                </Col>
                <Col xs="auto">
                    <Button variant="primary" type="submit">
                        Apply model
                    </Button>
                </Col>
            </Row>
        </Form>
    )
}

function PostCorrTrainingForm(props) {
    const { email, setEmail } = React.useContext(AppContext);
    const popover_source = (
        <Popover id="popover-basic">
            <Popover.Header as="h3">Upload source data</Popover.Header>
            <Popover.Body>
                Upload the subset of first-pass OCR output that have been manually corrected. Files should be in plain txt format.
            </Popover.Body>
        </Popover>
    );
    const popover_target = (
        <Popover id="popover-basic">
            <Popover.Header as="h3">Upload target data</Popover.Header>
            <Popover.Body>
                Upload the manually corrected set of OCR output files. The names of files should be same as the ones in the source data set.
            </Popover.Body>
        </Popover>
    );
    const popover_unlabeled = (
        <Popover id="popover-basic">
            <Popover.Header as="h3">Upload unlabeled data</Popover.Header>
            <Popover.Body>
                This is optional. Any uncorrected files from the first-pass OCR output can be uploaded here.
            </Popover.Body>
        </Popover>
    );
    const popover_modelid = (
        <Popover id="popover-basic">
            <Popover.Header as="h3">Specify a unique model ID</Popover.Header>
            <Popover.Body>
                Allowed characters: a-z A-Z 1-9 - _
                <p>Once training has started, you can monitor its status in "Your models" page.</p>
            </Popover.Body>
        </Popover>
    );
    return (
        <Form className="my-4" onSubmit={props.handleSubmit}>
            <Row>
                <Col xs="4">
                    <Form.Group controlId="sourceData">
                        <OverlayTrigger trigger="hover" delay={{ show: 250, hide: 400 }} placement="top" overlay={popover_source}>
                        <Form.Control type="file" multiple="multiple" onChange={props.handleSourceFileSelect} accept="text/plain" required={true} title=""/>
                        </OverlayTrigger>
                        <Form.Label className="mt-2">Source Data (plain text files)</Form.Label>
                    </Form.Group>
                </Col>
                <Col xs="4">
                    <Form.Group controlId="targetData">
                        <OverlayTrigger trigger="hover" delay={{ show: 250, hide: 400 }} placement="top" overlay={popover_target}>
                        <Form.Control type="file" multiple="multiple" onChange={props.handleTargetFileSelect} accept="text/plain" required={true} title=""/>
                        </OverlayTrigger>
                        <Form.Label className="mt-2">Target Data (plain text files)</Form.Label>
                    </Form.Group>
                </Col>
                <Col xs="4">
                    <Form.Group controlId="unlabeledData">
                        <OverlayTrigger trigger="hover" delay={{ show: 250, hide: 400 }} placement="top" overlay={popover_unlabeled}>
                        <Form.Control type="file" multiple="multiple" onChange={props.handleUnlabeledFileSelect} accept="text/plain" required={false} title=""/>
                        </OverlayTrigger>
                        <Form.Label className="mt-2">Unlabeled Data (optional)</Form.Label>
                    </Form.Group>
                </Col>
            </Row>
            <Row>
                <Col xs="auto">
                    <Form.Group controlId="modelIDinput">
                        <OverlayTrigger trigger="hover" delay={{ show: 250, hide: 400 }} placement="top" overlay={popover_modelid}>
                        <Form.Control type="text" onFocus={props.getModelIDs} onChange={props.handleModelIDChange} required={true} isInvalid={props.modelIDinvalid} title=""/>
                        </OverlayTrigger>
                        <Form.Control.Feedback type="invalid">{props.modelIDerror}</Form.Control.Feedback>
                        <Form.Label className="mt-2">Model ID</Form.Label>
                    </Form.Group>
                </Col>
                <Col xs="auto" className="d-none">
                    <Form.Group className="d-none" controlId="emailAddress">
                        <Form.Control type="email" onChange={props.handleEmailChange} required={true} defaultValue={email}/>
                        <Form.Label className="mt-2">Email Address</Form.Label>
                    </Form.Group>
                </Col>
                <Col xs="auto">
                    <Button variant="primary" type="submit">
                        Train new model
                    </Button>
                </Col>
            </Row>
        </Form>
    );
}

function PostCorrInference() {
    const [testData, setTestData] = useState();
    const [modelID, setModelID] = useState();
    //const [email, setEmail] = useState();
    const { email, setEmail } = React.useContext(AppContext);
    const [textMessage, setTextMessage] = useState();

    function handleSubmit(e) {
        e.preventDefault();
        setTextMessage("Uploading...");
        console.log("You clicked upload on the post-correction prediction form.");

        // Add code to send modelFile, unlabeledFiles, email to the backend and get monitoring URL.

        var url = window.cmulab_domain + "/annotator/test_single_source_ocr/";

        const formData = new FormData();
        var params = {
            "debug": window.debug
        }
        formData.append("params", JSON.stringify(params));
        formData.append("email", email);
        formData.append("model_id", modelID);

        var testZip = new JSZip();
        for (let i = 0; i < testData.length; i++) {
            // formData.append("testData", testData[i]);
            if (!isText(testData[i])) {
                setTextMessage("Please upload text files only!");
                return;
            }
            testZip.file(testData[i].name, testData[i]);
        }
        testZip.generateAsync({ type: "blob" }).then(function (test_blob) {
            formData.append('testData', test_blob, "testData.zip");

            const config = {
                headers: {
                    "content-type": "multipart/form-data",
                    //Authorization: "5e72d818c2f4250687f090bb7ec5466184982edc",
                    Authorization: window.auth_token,
                    "X-CSRFToken": window.csrf_token,
                },
            };

            axios.post(url, formData, config).then((response) => {
                console.log(response.data);
                let log_file = response.data;
                setTextMessage(<><p className="mb-0" key="0">
                        Post-correction job submitted!
                        </p>
                        <p className="mb-0" key="1">
                        You can monitor the status <a target="_blank" href={log_file}>here</a>.
                        </p>
                        <p className="mb-0" key="2">
                        When processing is complete, an email will be sent to {email}.
                        </p></>);
                //setTextMessage(JSON.stringify(response.data));
            }).catch( function (error) { setTextMessage(error.message); });
        });
}

    function handleModelIDChange(e) {
        e.preventDefault();
        console.log("model ID changed");
        setModelID(e.target.value.trim());
    }

    function handleTestDataSelect(e) {
        e.preventDefault();
        console.log("You selected unlabeled data files on the post-correction inference form.");
        setTestData(e.target.files);
    }

    function handleEmailChange(e) {
        e.preventDefault();
        console.log("Email address updated");
        setEmail(e.target.value.trim());
    }

    return (
        <Container>
            <Row>
                {/* <Accordion>
                    <Accordion.Item eventKey="predict" key="predict">
                        <Accordion.Header>Correct errors using a trained model</Accordion.Header>
                        <Accordion.Body> */}
                            <Container>
                                <Row className="justify-content-center">
                                    <Col xs="auto">
                                        <PostCorrInferenceForm handleSubmit={handleSubmit}
                                         handleModelIDChange={handleModelIDChange}
                                         handleTestDataSelect={handleTestDataSelect}
                                         handleEmailChange={handleEmailChange} />
                                    </Col>
                                </Row>
                                <Row className="justify-content-center text-success">
                                    {textMessage}
                                </Row>
                            </Container>
                        {/* </Accordion.Body>
                    </Accordion.Item>
                </Accordion> */}
            </Row>
        </Container>
    )
}

function PostCorrTraining() {
    const [sourceFiles, setSourceFiles] = useState();
    const [targetFiles, setTargetFiles] = useState();
    const [unlabeledFiles, setUnlabeledFiles] = useState([]);
    //const [email, setEmail] = useState();
    const { email, setEmail } = React.useContext(AppContext);
    const [modelID, setModelID] = useState();
    const [modelIDs, setModelIDs] = useState();
    const [modelIDinvalid, setModelIDinvalid] = useState();
    const [modelIDerror, setModelIDerror] = useState();
    const [textMessage, setTextMessage] = useState();

    useEffect(getModelIDs, []) // <-- empty dependency array means it will only run on first render


    function handleSubmit(e) {
        e.preventDefault();
        if (! validateModelID(modelID)) {
            setTextMessage(modelIDerror);
            return false;
        }
        setTextMessage("Uploading...");
        console.log("You clicked upload on the post-correction training form.");

        // Add code to send labeledFiles, unlabeledFiles, email to the backend and get monitoring URL.

        var url = window.cmulab_domain + "/annotator/train_single_source_ocr/";

        const formData = new FormData();
        var params = {
            "debug": window.debug
        }
        formData.append("params", JSON.stringify(params));
        formData.append("email", email);
        formData.append("modelID", modelID);

        var allFiles = [...sourceFiles, ...targetFiles, ...unlabeledFiles];
        for (let i = 0; i < allFiles.length; i++) {
            if (!isText(allFiles[i])) {
                setTextMessage("Please upload text files only!");
                return;
            }
        }
        var sourceFilesSet = new Set();
        for (let i = 0; i < sourceFiles.length; i++) {
            sourceFilesSet.add(sourceFiles[i].name);
        }
        var targetFilesSet = new Set();
        for (let i = 0; i < targetFiles.length; i++) {
            targetFilesSet.add(targetFiles[i].name);
        }
        if (targetFilesSet.size !== sourceFilesSet.size) {
            setTextMessage("The number of source and target files should be equal!");
            return;
        }
        if (![...targetFilesSet].every((x) => sourceFilesSet.has(x))) {
            setTextMessage("Source and target files should have the same file names!");
            return;
        }
        
        // for (let i = 0; i < sourceFiles.length; i++) {
        //     formData.append("srcData", sourceFiles[i]);
        // }
        // for (let i = 0; i < targetFiles.length; i++) {
        //     formData.append("tgtData", targetFiles[i]);
        // }
        // for (let i = 0; i < unlabeledFiles.length; i++) {
        //     formData.append("unlabeledData", unlabeledFiles[i]);
        // }

        var srcZip = new JSZip();
        for (let i = 0; i < sourceFiles.length; i++) {
            srcZip.file(sourceFiles[i].name, sourceFiles[i]);
        }
        srcZip.generateAsync({ type: "blob" }).then(function (src_blob) {
            formData.append('srcData', src_blob, "sourceFiles.zip");
            var tgtZip = new JSZip();
            for (let i = 0; i < targetFiles.length; i++) {
                tgtZip.file(targetFiles[i].name, targetFiles[i]);
            }
            tgtZip.generateAsync({ type: "blob" }).then(function (tgt_blob) {
                formData.append('tgtData', tgt_blob, "targetFiles.zip");
                var unlabeledZip = new JSZip();
                for (let i = 0; i < unlabeledFiles.length; i++) {
                    unlabeledZip.file(unlabeledFiles[i].name, unlabeledFiles[i]);
                }
                unlabeledZip.generateAsync({ type: "blob" }).then(function (unlabeled_blob) {
                    if (unlabeledFiles.length > 0) {
                        formData.append('unlabeledData', unlabeled_blob, "unlabeledFiles.zip");
                    }

                    const config = {
                        headers: {
                            "content-type": "multipart/form-data",
                            //Authorization: "5e72d818c2f4250687f090bb7ec5466184982edc",
                            Authorization: window.auth_token,
                            "X-CSRFToken": window.csrf_token,
                        },
                    };

                    axios.post(url, formData, config).then((response) => {
                        console.log(response.data);
                        let log_file = response.data[0]["log_file"]
                        let model_id = response.data[0]["model_id"]

                        setTextMessage(<><p className="mb-0" key="0">
                                Training data submitted, the new model ID is <b>{model_id}</b>
                                </p>
                                <p className="mb-0" key="1">
                                You can monitor the status <a target="_blank" href={log_file}>here</a>.
                                </p>
                                <p className="mb-0" key="2">
                                When training is complete, an email will be sent to {email}.
                                </p></>);
                        //setTextMessage(JSON.stringify(response.data));
                    }).catch( function (error) { 
                        console.log(error);
                        setTextMessage(error.message + ": " + error.response.data);
                    });
                });
            });
        });


    }

    function handleSourceFileSelect(e) {
        e.preventDefault();
        console.log("You selected source data files on the post-correction training form.");
        setSourceFiles(e.target.files);
    }

    function handleTargetFileSelect(e) {
        e.preventDefault();
        console.log("You selected target data files on the post-correction training form.");
        setTargetFiles(e.target.files);
    }

    function handleUnlabeledFileSelect(e) {
        e.preventDefault();
        console.log("You selected unlabeled data files on the post-correction training form.");
        setUnlabeledFiles(e.target.files);
    }

    function handleEmailChange(e) {
        e.preventDefault();
        console.log("Email address updated");
        setEmail(e.target.value.trim());
    }

    function getModelIDs(e) {
        //e.preventDefault();
        console.log("Getting list of model IDs");
        axios.get("/annotator/get_model_ids").then((response) => {
            console.log(response.data);
            setModelIDs(response.data);
        }).catch( function (error) {
            console.log(error);
        });
    }

    function validateModelID(model_id) {
        if (! /^[a-zA-Z0-9_-]+$/.test(model_id)) {
            console.log("Allowed characters a-z A-Z 1-9 - _");
            setModelIDerror("Allowed characters a-z A-Z 1-9 - _");
            setModelIDinvalid(true);
            return false;
        } else if (modelIDs.includes(model_id)) {
            console.log("This model ID already exists");
            setModelIDerror("This model ID already exists");
            setModelIDinvalid(true);
            return false;
        }
        return true;
    }

    function handleModelIDChange(e) {
        e.preventDefault();
        console.log("Model ID updated");
        setModelIDinvalid(false);
        let model_id = e.target.value.trim();
        validateModelID(model_id);
        setModelID(model_id);
    }


    return (
        <Container>
            <Row>
                {/* <Accordion className="pb-3">
                    <Accordion.Item eventKey="train" key="train">
                        <Accordion.Header>Train a new post-correction model</Accordion.Header>
                        <Accordion.Body> */}
                            <Container>
                                <Row className="justify-content-center">
                                    <Col xs="auto">
                                        <PostCorrTrainingForm 
                                        handleSubmit={handleSubmit}
                                        handleSourceFileSelect={handleSourceFileSelect} 
                                        handleTargetFileSelect={handleTargetFileSelect} 
                                        handleUnlabeledFileSelect={handleUnlabeledFileSelect}
                                        handleModelIDChange={handleModelIDChange}
                                        getModelIDs={getModelIDs}
                                        modelIDinvalid={modelIDinvalid}
                                        modelIDerror={modelIDerror}
                                        handleEmailChange={handleEmailChange} />
                                    </Col>
                                </Row>
                                <Row className="justify-content-center text-success">
                                    {textMessage}
                                </Row>
                            </Container>
                        {/* </Accordion.Body>
                    </Accordion.Item>
                </Accordion> */}
            </Row>
        </Container>
    )
}

function OCR() {
    const [files, setFiles] = useState();
    const [imgUploads, setUploads] = useState();
    //const [email, setEmail] = useState();
    const { email, setEmail } = React.useContext(AppContext);
    const [textMessage, setTextMessage] = useState();
    const [ocrSystem, setSystem] = useState("google"); // ocrSystem variable is updated with the form, but not used in processing. It can be used for adding systems in the future.

    function handleSubmit(e) {
        e.preventDefault();
        console.log("You clicked upload on the OCR form.");

        setTextMessage("Processing files...");

        let imgArr = [];

        const formData = new FormData();

        var url = window.cmulab_domain + "/annotator/ocr-post-correction/";

        var params = {
            "debug": window.debug
        }
        formData.append("params", JSON.stringify(params));
        formData.append("email", email);

        var fzip = new JSZip();
        for (let i = 0; i < files.length; i++) {
            if (!isImage(files[i])) {
                setTextMessage("Please upload images only!");
                return;
            }
            // formData.append("file", files[i]);
            // formData.append("fileName", files[i].name);
            imgArr[i] = { key: files[i].name, name: files[i].name, url: URL.createObjectURL(files[i]), text: "" };
            fzip.file(files[i].name, files[i]);
        }
        fzip.generateAsync({ type: "blob" }).then(function (blob) {
            // saveAs(blob, "images.zip");
            formData.append('file', blob, "images.zip");

            const config = {
                headers: {
                    "content-type": "multipart/form-data",
                    //Authorization: "5e72d818c2f4250687f090bb7ec5466184982edc",
                    Authorization: window.auth_token,
                    "X-CSRFToken": window.csrf_token,
                },
            };

            axios.post(url, formData, config).then((response) => {
                console.log(response.data);

                if (Array.isArray(response.data)) {
                    setTextMessage(JSON.stringify(response.data));
                    let job_id = response.data[0]["job_id"];
                    let status_url = response.data[0]["status_url"];
                    let status = response.data[0]["status"];
                    setTextMessage(<><p className="mb-0" key="0">
                            Files uploaded successfully and task has been queued!
                            </p>
                            <p className="mb-0" key="1">
                            You can monitor the status <a target="_blank" href={status_url}>here</a>.
                            </p>
                            <p className="mb-0" key="2">
                            When recognition is complete, an email will be sent to {email}.
                            </p></>);
                } else {
                    let i = 0;
                    for (let key in response.data) {
                        // response.data[key] = "Test\nTest\nTest" + key;
                        let value = response.data[key];
                        imgArr[i]["text"] = value;
                        i += 1;
                    }
                    setUploads(imgArr);
                    setTextMessage("");
                }
            }).catch( function (error) { setTextMessage(error.message); });
        });
    }

    function handleFileSelect(e) {
        e.preventDefault();
        console.log("You selected files on the OCR form.");
        setFiles(e.target.files);
    }

    function handleSystemSelect(e) {
        e.preventDefault();
        console.log("You chose a system.");
        setSystem(e.target.value);
    }

    function handleEmailChange(e) {
        e.preventDefault();
        console.log("Email address updated");
        setEmail(e.target.value.trim());
    }

    return (
        <Container>
            <Row className="justify-content-center">
                <Col xs="auto">
                    <OCRForm handleSubmit={handleSubmit} handleFileSelect={handleFileSelect} handleSystemSelect={handleSystemSelect} handleEmailChange={handleEmailChange}/>
                </Col>
            </Row>
            <Row className="justify-content-center fs-5 text-success">
                {textMessage}
            </Row>
            <DisplayImages imgUploads={imgUploads} />
        </Container>
    );
}

function Settings() {
    const { email, setEmail } = React.useContext(AppContext);
    const [authToken, setAuthToken] = useState("8470ede027588b80c5b82ab5c9e78b8daea68635");
    window.auth_token = authToken;
    const [cmulabDomain, setCmulabDomain] = useState("http://localhost:8088");
    window.cmulab_domain = cmulabDomain;
    const [textMessage, setTextMessage] = useState();

    useEffect(()=>{
        axios.get("/annotator/get_auth_token/").then((response) => {
            console.log(response);
            if (response.status === 401) {
                window.location.href = "/accounts/login/?next=/static/ocr-web-interface/index.html";
            }
            setEmail(response.data.email);
            window.email = response.data.email;
            setAuthToken(response.data.auth_token);
            window.auth_token = response.data.auth_token;
            setCmulabDomain("");
            window.cmulab_domain = "";
            window.csrf_token = response.data.csrf_token;
        }).catch( function (error) {
            console.log(error);
            if (error.response.status === 401) {
            window.location.href = "/accounts/login/?next=/static/ocr-web-interface/index.html";
            }
        });
    }, []) // <-- empty dependency array


    function handleSubmit(e) {
        e.preventDefault();
        console.log("You saved settings.");
        window.email = email;
        window.auth_token = authToken;
        window.cmulab_domain = cmulabDomain;
        setTextMessage(<><p className="mb-0" key="0">
                Settings saved!
                </p>
                <p className="mb-0" key="1">
                    <small>Email: {email}</small>
                </p>
                <p className="mb-0" key="2">
                    <small>Auth Token: {authToken}</small>
                </p>
                <p className="mb-0" key="3">
                    <small>CMULAB domain: {cmulabDomain}</small>
                </p></>);
    }

    function handleEmailChange(e) {
        e.preventDefault();
        console.log("Email address updated");
        setEmail(e.target.value.trim());
    }

    function handleAuthTokenChange(e) {
        e.preventDefault();
        console.log("Email address updated");
        setAuthToken(e.target.value.trim());
    }

    function handleCmulabDomainChange(e) {
        e.preventDefault();
        console.log("Email address updated");
        setCmulabDomain(e.target.value.trim().replace(/\/+$/, ""));
    }


    return (
        <Container>
            <Row className="d-none justify-content-center">
                <Col xs="auto">
                    <SettingsForm handleSubmit={handleSubmit}
                    authToken={authToken}
                    handleAuthTokenChange={handleAuthTokenChange}
                    cmulabDomain={cmulabDomain}
                    handleCmulabDomainChange={handleCmulabDomainChange}
                    handleEmailChange={handleEmailChange}/>
                </Col>
            </Row>
            <Row className="justify-content-center fs-5 text-success">
                {textMessage}
            </Row>
        </Container>
    );
}

function SettingsForm(props) {
    const { email, setEmail } = React.useContext(AppContext);
    let auth_token_url = props.cmulabDomain + "/annotator/get_auth_token/";

    return (
        <Form className="my-4" onSubmit={props.handleSubmit}>
            <Row>
                <Col xs="auto">
                    <Form.Group className="d-none" controlId="emailAddress">
                        <Form.Control type="email" onChange={props.handleEmailChange} required={true} defaultValue={email}/>
                        <Form.Label className="mt-2">Email Address</Form.Label>
                    </Form.Group>
                </Col>
                <Col xs="auto">
                    <Form.Group controlId="authToken">
                        <Form.Control type="text" onChange={props.handleAuthTokenChange} required={true} defaultValue={props.authToken}/>
                        <Form.Label className="mt-2">Auth Token</Form.Label>
                    </Form.Group>
                    Get an Auth Token <a target="_blank" href={auth_token_url}>here</a>
                </Col>
                <Col xs="auto">
                    <Form.Group controlId="cmulabDoman">
                        <Form.Control type="text" onChange={props.handleCmulabDomainChange} required={true} defaultValue={props.cmulabDomain}/>
                        <Form.Label className="mt-2">CMULAB domain</Form.Label>
                    </Form.Group>
                </Col>
                <Col xs="auto">
                    <Button variant="primary" type="submit">
                        Save
                    </Button>
                </Col>
            </Row>
        </Form>
    );
}

const AppContext = React.createContext();

function App() {
    console.log("Loading App...");
    const [email, setEmail] = useState();
    if (window.debug === undefined) {
        window.debug = 0;
    }

    return (
        <AppContext.Provider value={{ email, setEmail }}>
        <div className="App">
            {/* <Tabs defaultActiveKey="ocr" transition={false} id="uncontrolled-tab" className="mb-3">
                <Tab eventKey="settings" title="⚙" disabled>
                    <Settings></Settings>
                </Tab>
                <Tab eventKey="ocr" title="1. Off-the-shelf OCR">
                    <OCR></OCR>
                </Tab>
                <Tab eventKey="post" title="2. Automatic Post-correction">
                    <PostCorrTraining></PostCorrTraining>
                    <PostCorrInference></PostCorrInference>
                </Tab>
            </Tabs> */}
            <Settings></Settings>
            <Card style={{ width: '100%' }}><Card.Body>
            <Card.Title className="mb-3 fw-normal">Optical Character Recognition (OCR)</Card.Title>
            <Accordion className="pb-3">
                <Accordion.Item eventKey="ocr" key="ocr">
                    <Accordion.Header>1. Use an off-the-shelf OCR engine</Accordion.Header>
                    <Accordion.Body>
                        <OCR></OCR>
                    </Accordion.Body>
                </Accordion.Item>
                <Accordion.Item eventKey="train" key="train">
                    <Accordion.Header>2. Train a new OCR post-correction model</Accordion.Header>
                    <Accordion.Body>
                        <PostCorrTraining></PostCorrTraining>
                    </Accordion.Body>
                </Accordion.Item>
                <Accordion.Item eventKey="predict" key="predict">
                    <Accordion.Header>3. Correct errors using a trained OCR post-correction model</Accordion.Header>
                    <Accordion.Body>
                        <PostCorrInference></PostCorrInference>
                    </Accordion.Body>
                </Accordion.Item>
            </Accordion>
            </Card.Body></Card>
        </div>
        </AppContext.Provider>
    );
}

export default App;

