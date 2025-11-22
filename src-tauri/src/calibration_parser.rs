use serde::{Deserialize, Serialize};

#[derive(Debug, Serialize, Deserialize)]
#[derive(PartialEq)]
pub enum ParserState {
    Idle,
    TestPolePairs,
    TestEncoderDirection,
    TestR,
    TestLd,
    TestLq,
    TestSpeedPI,
    Done,
}

pub struct CalibrationParser(pub ParserState);

impl CalibrationParser {
    pub fn new() -> Self {
        Self(ParserState::Idle)
    }

    pub fn parse(&mut self, line: &str) -> Result<(), String> {
        match self.0 {
            ParserState::Idle => {
                if line.contains("test ready.start test now.") {
                    self.0 = ParserState::TestPolePairs;
                    Ok(())
                } else {
                    Err("invalid state, waiting for start".into())
                }
            }
            ParserState::TestPolePairs => {
                if line.contains("pole_pairs read done") {
                    self.0 = ParserState::TestEncoderDirection;
                    Ok(())
                } else {
                    Err("invalid state, waiting for pole pairs".into())
                }
            }
            ParserState::TestEncoderDirection => {
                if line.contains("offset read done.") {
                    self.0 = ParserState::TestR;
                    Ok(())
                } else if line.contains("offset read failed.") {
                    Err("offset read failed".into())
                } else {
                    Err("invalid state, waiting for offset".into())
                }
            }
            ParserState::TestR => {
                if line.contains("R read done") {
                    self.0 = ParserState::TestLd;
                    Ok(())
                } else {
                    Err("invalid state, waiting for R".into())
                }
            }
            ParserState::TestLd => {
                if line.contains("Ld read done") {
                    self.0 = ParserState::TestLq;
                    Ok(())
                } else {
                    Err("invalid state, waiting for Ld".into())
                }
            }
            ParserState::TestLq => {
                if line.contains("Lq read done") {
                    self.0 = ParserState::TestSpeedPI;
                    Ok(())
                } else {
                    Err("invalid state, waiting for Lq".into())
                }
            }
            ParserState::TestSpeedPI => {
                if line.contains("Speed PI set done") {
                    self.0 = ParserState::Done;
                    Ok(())
                } else {
                    Err("invalid state, waiting for SpeedPI".into())
                }
            }
            ParserState::Done => {
                Err("invalid state, calibration is done".into())
            }
        }
    }

    pub fn is_done(&self) -> bool {
        self.0 == ParserState::Done
    }
}