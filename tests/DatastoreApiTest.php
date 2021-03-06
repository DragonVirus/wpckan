<?php

require_once dirname(dirname(__FILE__)) . '/utils/datastore-api.php';
require_once dirname(dirname(__FILE__)) . '/utils/wpckan-api.php';
require_once dirname(dirname(__FILE__)) . '/utils/wpckan-options.php';

class DatastoreApiTest extends PHPUnit_Framework_TestCase
{

  private $get_options_stub;

  public function setUp()
  {
    parent::setUp();

    $GLOBALS['wpckan_options'] = $this->getMockBuilder(Wpckan_Options::class)
                                   ->setMethods(['get_option'])
                                   ->getMock();

    $GLOBALS['wpckan_options']->method('get_option')
                           ->will($this->returnValueMap(array(
                                array('wpckan_setting_cache_enabled', false),
                                array('wpckan_setting_log_enabled', false)
                            )));
  }

  public function tearDown()
  {
    parent::tearDown();
  }

  public function testIncorrectCkanDomain()
  {
      $results = wpckan_get_datastore_resource('incorrect_domain','some_resource_id');
      $this->assertEmpty($results);
  }

  public function testIncorrectResourceIdDomain()
  {
      $results = wpckan_get_datastore_resource('https://data.opendevelopmentmekong.net','some_resource_id');
      $this->assertEmpty($results);
  }

  public function testCorrectConfig()
  {
      $results = wpckan_get_datastore_resource('https://data.opendevelopmentmekong.net','3b817bce-9823-493b-8429-e5233ba3bd87');
      $this->assertFalse(empty($results));
  }

}
