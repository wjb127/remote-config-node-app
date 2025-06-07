const express = require('express');
const cors = require('cors');
const pool = require('./database');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3001;

// 미들웨어
app.use(cors());
app.use(express.json());

// 모든 설정 조회
app.get('/api/configs', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM configs ORDER BY key');
    res.json(result.rows);
  } catch (error) {
    console.error('설정 조회 오류:', error);
    res.status(500).json({ error: '설정을 가져오는 중 오류가 발생했습니다.' });
  }
});

// 특정 설정 조회
app.get('/api/configs/:key', async (req, res) => {
  try {
    const { key } = req.params;
    const result = await pool.query('SELECT * FROM configs WHERE key = $1', [key]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: '설정을 찾을 수 없습니다.' });
    }
    
    res.json(result.rows[0]);
  } catch (error) {
    console.error('설정 조회 오류:', error);
    res.status(500).json({ error: '설정을 가져오는 중 오류가 발생했습니다.' });
  }
});

// 클라이언트용 설정 조회 (간단한 형태)
app.get('/api/client-config', async (req, res) => {
  try {
    const result = await pool.query('SELECT key, value, type FROM configs');
    
    // 클라이언트에서 사용하기 쉬운 형태로 변환
    const config = {};
    result.rows.forEach(row => {
      let value = row.value;
      
      // 타입에 따라 값 변환
      if (row.type === 'boolean') {
        value = value === 'true';
      } else if (row.type === 'number') {
        value = parseFloat(value);
      }
      
      config[row.key] = value;
    });
    
    res.json(config);
  } catch (error) {
    console.error('클라이언트 설정 조회 오류:', error);
    res.status(500).json({ error: '설정을 가져오는 중 오류가 발생했습니다.' });
  }
});

// 설정 생성
app.post('/api/configs', async (req, res) => {
  try {
    const { key, value, description, type = 'string' } = req.body;
    
    if (!key || !value) {
      return res.status(400).json({ error: 'key와 value는 필수입니다.' });
    }
    
    const result = await pool.query(
      'INSERT INTO configs (key, value, description, type) VALUES ($1, $2, $3, $4) RETURNING *',
      [key, value, description, type]
    );
    
    res.status(201).json(result.rows[0]);
  } catch (error) {
    if (error.code === '23505') { // 중복 키 오류
      return res.status(409).json({ error: '이미 존재하는 설정 키입니다.' });
    }
    console.error('설정 생성 오류:', error);
    res.status(500).json({ error: '설정을 생성하는 중 오류가 발생했습니다.' });
  }
});

// 설정 수정
app.put('/api/configs/:key', async (req, res) => {
  try {
    const { key } = req.params;
    const { value, description, type } = req.body;
    
    if (!value) {
      return res.status(400).json({ error: 'value는 필수입니다.' });
    }
    
    const result = await pool.query(
      'UPDATE configs SET value = $1, description = $2, type = $3, updated_at = CURRENT_TIMESTAMP WHERE key = $4 RETURNING *',
      [value, description, type, key]
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: '설정을 찾을 수 없습니다.' });
    }
    
    res.json(result.rows[0]);
  } catch (error) {
    console.error('설정 수정 오류:', error);
    res.status(500).json({ error: '설정을 수정하는 중 오류가 발생했습니다.' });
  }
});

// 설정 삭제
app.delete('/api/configs/:key', async (req, res) => {
  try {
    const { key } = req.params;
    
    const result = await pool.query('DELETE FROM configs WHERE key = $1 RETURNING *', [key]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: '설정을 찾을 수 없습니다.' });
    }
    
    res.json({ message: '설정이 삭제되었습니다.' });
  } catch (error) {
    console.error('설정 삭제 오류:', error);
    res.status(500).json({ error: '설정을 삭제하는 중 오류가 발생했습니다.' });
  }
});

// 서버 시작
app.listen(PORT, '0.0.0.0', () => {
  console.log(`서버가 http://0.0.0.0:${PORT} 에서 실행 중입니다.`);
});

module.exports = app; 