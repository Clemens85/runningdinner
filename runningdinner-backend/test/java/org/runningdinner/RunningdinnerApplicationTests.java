package org.runningdinner;

import org.junit.runner.RunWith;
import org.springframework.test.context.web.WebAppConfiguration;
import org.springframework.boot.test.SpringApplicationConfiguration;
import org.springframework.test.context.junit4.SpringJUnit4ClassRunner;

@RunWith(SpringJUnit4ClassRunner.class)
@SpringApplicationConfiguration(classes = RunningdinnerApplication.class)
@WebAppConfiguration
public class RunningdinnerApplicationTests {

	@Test
	public void contextLoads() {
	}

}
